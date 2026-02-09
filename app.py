from flask import Flask, request, jsonify
import gspread
from google.oauth2.service_account import Credentials
from flask_cors import CORS
import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS - Allow all origins in development, specific origins in production
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=ALLOWED_ORIGINS)

# Google Sheets setup with environment variables
def get_credentials():
    """Get Google Sheets credentials from environment or file"""
    try:
        # Define the scopes
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive"
        ]
        
        # Try to load from environment variable (for production)
        creds_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        if creds_json:
            creds_dict = json.loads(creds_json)
            return Credentials.from_service_account_info(creds_dict, scopes=scopes)
        
        # Fallback to file (for local development)
        if os.path.exists("service_account.json"):
            return Credentials.from_service_account_file("service_account.json", scopes=scopes)
        
        raise FileNotFoundError("No credentials found. Set GOOGLE_CREDENTIALS_JSON or provide service_account.json")
    except Exception as e:
        logger.error(f"Error loading credentials: {e}")
        raise

def get_sheet():
    """Get Google Sheet with error handling"""
    try:
        creds = get_credentials()
        client = gspread.authorize(creds)
        
        # Get sheet ID from environment or use default
        sheet_id = os.getenv('GOOGLE_SHEET_ID', 'YOUR_GOOGLE_SHEET_ID')
        if sheet_id == 'YOUR_GOOGLE_SHEET_ID':
            raise ValueError("GOOGLE_SHEET_ID environment variable not set")
        
        sheet = client.open_by_key(sheet_id)
        return sheet
    except Exception as e:
        logger.error(f"Error accessing Google Sheet: {e}")
        raise

def ensure_worksheets():
    """Ensure all required worksheets exist"""
    try:
        sheet = get_sheet()
        required_worksheets = ['Lots', 'Processes', 'Shipments', 'ChainOfCustody', 'TestingRecords']
        
        existing_worksheets = [ws.title for ws in sheet.worksheets()]
        
        for ws_name in required_worksheets:
            if ws_name not in existing_worksheets:
                logger.info(f"Creating worksheet: {ws_name}")
                sheet.add_worksheet(title=ws_name, rows=1000, cols=50)
                # Add headers based on worksheet type
                ws = sheet.worksheet(ws_name)
                if ws_name == 'Lots':
                    ws.append_row(['id', 'category', 'quantity', 'unit', 'date', 'vendor', 'productType', 
                                   'cannabinoidProfile', 'notes', 'status', 'type', 'timestamp'])
                elif ws_name == 'Processes':
                    ws.append_row(['id', 'type', 'date', 'inputs', 'outputs', 'notes', 'timestamp'])
                elif ws_name == 'Shipments':
                    ws.append_row(['id', 'lotId', 'date', 'recipient', 'quantity', 'carrier', 'trackingNumber', 'notes', 'timestamp'])
                elif ws_name == 'ChainOfCustody':
                    ws.append_row(['id', 'lotId', 'action', 'description', 'timestamp', 'details'])
                elif ws_name == 'TestingRecords':
                    ws.append_row(['id', 'lotId', 'testType', 'date', 'results', 'labName', 'certificationNumber', 'notes', 'timestamp'])
        
        logger.info("All required worksheets verified")
    except Exception as e:
        logger.error(f"Error ensuring worksheets: {e}")
        raise

def get_worksheet(name):
    """Get a specific worksheet with error handling"""
    try:
        sheet = get_sheet()
        return sheet.worksheet(name)
    except Exception as e:
        logger.error(f"Error accessing worksheet {name}: {e}")
        raise

def get_data(worksheet_name):
    """Get all data from a worksheet"""
    try:
        ws = get_worksheet(worksheet_name)
        return ws.get_all_records()
    except Exception as e:
        logger.error(f"Error getting data from {worksheet_name}: {e}")
        return []

def add_data(worksheet_name, data):
    """Add data to a worksheet"""
    try:
        ws = get_worksheet(worksheet_name)
        
        # Get headers to ensure proper column order
        headers = ws.row_values(1)
        if not headers:
            # If no headers, use data keys
            headers = list(data.keys())
            ws.append_row(headers)
        
        # Build row in correct order
        row = [data.get(header, '') for header in headers]
        ws.append_row(row)
        return True
    except Exception as e:
        logger.error(f"Error adding data to {worksheet_name}: {e}")
        raise

def update_data(worksheet_name, record_id, data):
    """Update data in a worksheet by ID"""
    try:
        ws = get_worksheet(worksheet_name)
        records = ws.get_all_records()
        
        # Find the row with matching ID
        for idx, record in enumerate(records):
            if str(record.get('id')) == str(record_id):
                # Update the row (idx + 2 because of 1-based indexing and header row)
                headers = ws.row_values(1)
                row = [data.get(header, record.get(header, '')) for header in headers]
                ws.update(f'A{idx + 2}:{chr(65 + len(headers) - 1)}{idx + 2}', [row])
                return True
        
        return False
    except Exception as e:
        logger.error(f"Error updating data in {worksheet_name}: {e}")
        raise

def delete_data(worksheet_name, record_id):
    """Delete data from a worksheet by ID"""
    try:
        ws = get_worksheet(worksheet_name)
        records = ws.get_all_records()
        
        # Find the row with matching ID
        for idx, record in enumerate(records):
            if str(record.get('id')) == str(record_id):
                # Delete the row (idx + 2 because of 1-based indexing and header row)
                ws.delete_rows(idx + 2)
                return True
        
        return False
    except Exception as e:
        logger.error(f"Error deleting data from {worksheet_name}: {e}")
        raise

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Try to access the sheet to verify connection
        sheet = get_sheet()
        return jsonify({
            "status": "healthy",
            "message": "Backend is running and connected to Google Sheets",
            "sheet_title": sheet.title
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "message": str(e)
        }), 500

# Initialize worksheets on startup
@app.route('/api/init', methods=['POST'])
def initialize():
    """Initialize all required worksheets"""
    try:
        ensure_worksheets()
        return jsonify({"message": "Worksheets initialized successfully"}), 200
    except Exception as e:
        logger.error(f"Initialization failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lots', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_lots():
    try:
        if request.method == 'GET':
            return jsonify(get_data('Lots'))
        elif request.method == 'POST':
            add_data('Lots', request.json)
            return jsonify({"message": "Lot added"}), 201
        elif request.method == 'PUT':
            lot_id = request.json.get('id')
            if not lot_id:
                return jsonify({"error": "ID required for update"}), 400
            if update_data('Lots', lot_id, request.json):
                return jsonify({"message": "Lot updated"}), 200
            else:
                return jsonify({"error": "Lot not found"}), 404
        elif request.method == 'DELETE':
            lot_id = request.args.get('id')
            if not lot_id:
                return jsonify({"error": "ID required for delete"}), 400
            if delete_data('Lots', lot_id):
                return jsonify({"message": "Lot deleted"}), 200
            else:
                return jsonify({"error": "Lot not found"}), 404
    except Exception as e:
        logger.error(f"Error in handle_lots: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/processes', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_processes():
    try:
        if request.method == 'GET':
            return jsonify(get_data('Processes'))
        elif request.method == 'POST':
            add_data('Processes', request.json)
            return jsonify({"message": "Process added"}), 201
        elif request.method == 'PUT':
            process_id = request.json.get('id')
            if not process_id:
                return jsonify({"error": "ID required for update"}), 400
            if update_data('Processes', process_id, request.json):
                return jsonify({"message": "Process updated"}), 200
            else:
                return jsonify({"error": "Process not found"}), 404
        elif request.method == 'DELETE':
            process_id = request.args.get('id')
            if not process_id:
                return jsonify({"error": "ID required for delete"}), 400
            if delete_data('Processes', process_id):
                return jsonify({"message": "Process deleted"}), 200
            else:
                return jsonify({"error": "Process not found"}), 404
    except Exception as e:
        logger.error(f"Error in handle_processes: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/shipments', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_shipments():
    try:
        if request.method == 'GET':
            return jsonify(get_data('Shipments'))
        elif request.method == 'POST':
            add_data('Shipments', request.json)
            return jsonify({"message": "Shipment added"}), 201
        elif request.method == 'PUT':
            shipment_id = request.json.get('id')
            if not shipment_id:
                return jsonify({"error": "ID required for update"}), 400
            if update_data('Shipments', shipment_id, request.json):
                return jsonify({"message": "Shipment updated"}), 200
            else:
                return jsonify({"error": "Shipment not found"}), 404
        elif request.method == 'DELETE':
            shipment_id = request.args.get('id')
            if not shipment_id:
                return jsonify({"error": "ID required for delete"}), 400
            if delete_data('Shipments', shipment_id):
                return jsonify({"message": "Shipment deleted"}), 200
            else:
                return jsonify({"error": "Shipment not found"}), 404
    except Exception as e:
        logger.error(f"Error in handle_shipments: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chainOfCustody', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_coc():
    try:
        if request.method == 'GET':
            return jsonify(get_data('ChainOfCustody'))
        elif request.method == 'POST':
            add_data('ChainOfCustody', request.json)
            return jsonify({"message": "CoC added"}), 201
        elif request.method == 'PUT':
            coc_id = request.json.get('id')
            if not coc_id:
                return jsonify({"error": "ID required for update"}), 400
            if update_data('ChainOfCustody', coc_id, request.json):
                return jsonify({"message": "CoC updated"}), 200
            else:
                return jsonify({"error": "CoC not found"}), 404
        elif request.method == 'DELETE':
            coc_id = request.args.get('id')
            if not coc_id:
                return jsonify({"error": "ID required for delete"}), 400
            if delete_data('ChainOfCustody', coc_id):
                return jsonify({"message": "CoC deleted"}), 200
            else:
                return jsonify({"error": "CoC not found"}), 404
    except Exception as e:
        logger.error(f"Error in handle_coc: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/testingRecords', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_testing():
    try:
        if request.method == 'GET':
            return jsonify(get_data('TestingRecords'))
        elif request.method == 'POST':
            add_data('TestingRecords', request.json)
            return jsonify({"message": "Testing record added"}), 201
        elif request.method == 'PUT':
            testing_id = request.json.get('id')
            if not testing_id:
                return jsonify({"error": "ID required for update"}), 400
            if update_data('TestingRecords', testing_id, request.json):
                return jsonify({"message": "Testing record updated"}), 200
            else:
                return jsonify({"error": "Testing record not found"}), 404
        elif request.method == 'DELETE':
            testing_id = request.args.get('id')
            if not testing_id:
                return jsonify({"error": "ID required for delete"}), 400
            if delete_data('TestingRecords', testing_id):
                return jsonify({"message": "Testing record deleted"}), 200
            else:
                return jsonify({"error": "Testing record not found"}), 404
    except Exception as e:
        logger.error(f"Error in handle_testing: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)