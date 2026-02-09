#!/usr/bin/env python3
"""
Test script for Thynk Tracking Backend API

This script tests the backend API endpoints to ensure they're working correctly.
It does NOT require Google Sheets credentials - it only tests the Flask app structure.

Usage:
    python test_api.py
"""

import unittest
import json
import os
import sys

# Set mock environment variables before importing app
os.environ['GOOGLE_SHEET_ID'] = 'test_sheet_id'
os.environ['ALLOWED_ORIGINS'] = '*'

# Mock the Google auth and gspread to avoid credential requirements
class MockCredentials:
    pass

class MockWorksheet:
    def __init__(self, title):
        self.title = title
        self._data = []
        self._headers = []
    
    def get_all_records(self):
        return self._data
    
    def append_row(self, row):
        self._data.append(dict(zip(self._headers, row)))
    
    def row_values(self, row_num):
        if row_num == 1:
            return self._headers
        return []
    
    def update(self, range_name, values):
        pass
    
    def delete_rows(self, start, end=None):
        pass

class MockSpreadsheet:
    def __init__(self):
        self.title = "Test Sheet"
        self._worksheets = {}
    
    def worksheets(self):
        return [MockWorksheet(name) for name in self._worksheets.keys()]
    
    def worksheet(self, title):
        if title not in self._worksheets:
            self._worksheets[title] = MockWorksheet(title)
        return self._worksheets[title]
    
    def add_worksheet(self, title, rows, cols):
        self._worksheets[title] = MockWorksheet(title)
        return self._worksheets[title]

class MockGspreadClient:
    def __init__(self):
        self.spreadsheet = MockSpreadsheet()
    
    def open_by_key(self, key):
        return self.spreadsheet

# Patch the modules
sys.modules['google.oauth2.service_account'] = type('MockModule', (), {
    'Credentials': type('Credentials', (), {
        'from_service_account_info': lambda *args, **kwargs: MockCredentials(),
        'from_service_account_file': lambda *args, **kwargs: MockCredentials()
    })
})()

sys.modules['gspread'] = type('MockModule', (), {
    'authorize': lambda creds: MockGspreadClient()
})()

# Now import the app
from app import app

class TestBackendAPI(unittest.TestCase):
    """Test cases for the backend API"""
    
    def setUp(self):
        """Set up test client"""
        self.app = app
        self.client = self.app.test_client()
        self.app.testing = True
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('status', data)
    
    def test_lots_get_endpoint(self):
        """Test GET /api/lots endpoint"""
        response = self.client.get('/api/lots')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_lots_post_endpoint(self):
        """Test POST /api/lots endpoint"""
        lot_data = {
            'id': 'TEST-001',
            'category': 'Plant Material',
            'quantity': 100,
            'unit': 'lbs',
            'status': 'active',
            'type': 'intake'
        }
        response = self.client.post(
            '/api/lots',
            data=json.dumps(lot_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('message', data)
    
    def test_processes_get_endpoint(self):
        """Test GET /api/processes endpoint"""
        response = self.client.get('/api/processes')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_shipments_get_endpoint(self):
        """Test GET /api/shipments endpoint"""
        response = self.client.get('/api/shipments')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_chain_of_custody_get_endpoint(self):
        """Test GET /api/chainOfCustody endpoint"""
        response = self.client.get('/api/chainOfCustody')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_testing_records_get_endpoint(self):
        """Test GET /api/testingRecords endpoint"""
        response = self.client.get('/api/testingRecords')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = self.client.get('/api/health')
        self.assertIn('Access-Control-Allow-Origin', response.headers)

def run_tests():
    """Run all tests"""
    print("=" * 70)
    print("Testing Thynk Tracking Backend API")
    print("=" * 70)
    print()
    
    # Run tests
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBackendAPI)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print()
    print("=" * 70)
    if result.wasSuccessful():
        print("✓ All tests passed!")
        print("=" * 70)
        return 0
    else:
        print("✗ Some tests failed")
        print("=" * 70)
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())
