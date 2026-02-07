from flask import Flask, request, jsonify
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

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

if __name__ == '__main__':
    app.run(debug=True)