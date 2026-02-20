from flask import Flask, request, jsonify
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
from smart_import import SmartImporter, analyze_import_file

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configure upload folder
UPLOAD_FOLDER = '/tmp/uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Google Sheets setup
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("service_account.json", scope)
client = gspread.authorize(creds)

# Open the Google Sheet (replace with your sheet ID)
sheet_id = "YOUR_GOOGLE_SHEET_ID"
sheet = client.open_by_key(sheet_id)

# Worksheets for different data
lots_sheet = sheet.worksheet('Lots')
processes_sheet = sheet.worksheet('Processes')
shipments_sheet = sheet.worksheet('Shipments')
coc_sheet = sheet.worksheet('ChainOfCustody')
testing_sheet = sheet.worksheet('TestingRecords')

def get_data(sheet):
    return sheet.get_all_records()

def add_data(sheet, data):
    sheet.append_row(list(data.values()))

@app.route('/api/lots', methods=['GET', 'POST'])
def handle_lots():
    if request.method == 'GET':
        return jsonify(get_data(lots_sheet))
    elif request.method == 'POST':
        add_data(lots_sheet, request.json)
        return jsonify({"message": "Lot added"}), 201

@app.route('/api/processes', methods=['GET', 'POST'])
def handle_processes():
    if request.method == 'GET':
        return jsonify(get_data(processes_sheet))
    elif request.method == 'POST':
        add_data(processes_sheet, request.json)
        return jsonify({"message": "Process added"}), 201

@app.route('/api/shipments', methods=['GET', 'POST'])
def handle_shipments():
    if request.method == 'GET':
        return jsonify(get_data(shipments_sheet))
    elif request.method == 'POST':
        add_data(shipments_sheet, request.json)
        return jsonify({"message": "Shipment added"}), 201

@app.route('/api/chainOfCustody', methods=['GET', 'POST'])
def handle_coc():
    if request.method == 'GET':
        return jsonify(get_data(coc_sheet))
    elif request.method == 'POST':
        add_data(coc_sheet, request.json)
        return jsonify({"message": "CoC added"}), 201

@app.route('/api/testingRecords', methods=['GET', 'POST'])
def handle_testing():
    if request.method == 'GET':
        return jsonify(get_data(testing_sheet))
    elif request.method == 'POST':
        add_data(testing_sheet, request.json)
        return jsonify({"message": "Testing record added"}), 201

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/import/analyze', methods=['POST'])
def analyze_import():
    """
    Analyze an uploaded file and return mapping suggestions.
    This endpoint provides a preview without importing the data.
    """
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'File type not allowed'}), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get data type from request
        data_type = request.form.get('data_type', 'lots')
        
        # Analyze the file
        result = analyze_import_file(filepath, data_type)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/import/execute', methods=['POST'])
def execute_import():
    """
    Execute the import with user-confirmed mappings.
    """
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'File type not allowed'}), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get parameters
        data_type = request.form.get('data_type', 'lots')
        user_mapping_json = request.form.get('mapping', '{}')
        try:
            user_mapping = json.loads(user_mapping_json) if user_mapping_json else {}
        except json.JSONDecodeError:
            user_mapping = {}
        
        # Execute import
        importer = SmartImporter(data_type)
        result = importer.import_file(filepath, user_mapping)
        
        # If successful, save to Google Sheets
        if result['success'] and result['data']:
            if data_type == 'lots':
                for record in result['data']:
                    add_data(lots_sheet, record)
            elif data_type == 'shipments':
                for record in result['data']:
                    add_data(shipments_sheet, record)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/import/schema', methods=['GET'])
def get_import_schema():
    """
    Return the expected schema for import data types.
    """
    data_type = request.args.get('data_type', 'lots')
    importer = SmartImporter(data_type)
    
    return jsonify({
        'data_type': data_type,
        'schema': importer.schema
    })

if __name__ == '__main__':
    app.run(debug=True)