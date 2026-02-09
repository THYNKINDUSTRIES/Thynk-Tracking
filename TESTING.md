# Testing Guide

## Overview
This guide explains how to test the Thynk Tracking system at different levels.

## Prerequisites

### For Backend Testing
- Python 3.8 or higher
- pip package manager
- Google Sheets API credentials (for integration tests)

### For Frontend Testing
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

## Backend Testing

### 1. Setup

```bash
# Run the setup script
./setup.sh

# Or manually:
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

### 2. Unit Tests

Run the API structure tests (no credentials needed):

```bash
python test_api.py
```

This tests:
- Flask app initialization
- Route definitions
- CORS configuration
- Basic endpoint responses

### 3. Integration Tests (with Google Sheets)

To test with actual Google Sheets:

1. **Set up Google Sheets**:
   - Follow the deployment guide to create credentials
   - Place `service_account.json` in the project root
   - Set `GOOGLE_SHEET_ID` in `.env`

2. **Initialize worksheets**:
   ```bash
   python app.py &
   sleep 2
   curl -X POST http://localhost:5000/api/init
   ```

3. **Test endpoints manually**:
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Get all lots
   curl http://localhost:5000/api/lots
   
   # Create a lot
   curl -X POST http://localhost:5000/api/lots \
     -H "Content-Type: application/json" \
     -d '{
       "id": "TEST-LOT-001",
       "category": "Plant Material",
       "quantity": 100,
       "unit": "lbs",
       "date": "2024-01-01",
       "vendor": "Test Vendor",
       "productType": "Flower",
       "status": "active",
       "type": "intake",
       "timestamp": "2024-01-01T12:00:00Z"
     }'
   
   # Verify it was created
   curl http://localhost:5000/api/lots
   
   # Update a lot
   curl -X PUT http://localhost:5000/api/lots \
     -H "Content-Type: application/json" \
     -d '{
       "id": "TEST-LOT-001",
       "quantity": 90
     }'
   
   # Delete a lot
   curl -X DELETE "http://localhost:5000/api/lots?id=TEST-LOT-001"
   ```

### 4. Load Testing (Optional)

For production readiness, test with load:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:5000/api/lots
```

## Frontend Testing

### 1. Local Development Server

Start a local server to avoid CORS issues:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (if installed)
npx http-server -p 8000

# Option 3: PHP (if installed)
php -S localhost:8000
```

Open: `http://localhost:8000`

### 2. Backend Connection Test

1. **Without backend** (localStorage only):
   - Open the app in your browser
   - Check the status badge shows "Offline Mode"
   - Add intake data
   - Verify data persists after page reload
   - Export data to verify structure

2. **With backend**:
   - Start the backend: `python app.py`
   - Open the app: `http://localhost:8000`
   - Check status badge shows "Backend Connected"
   - Add intake data
   - Check browser console for successful backend saves
   - Verify data appears in Google Sheets

### 3. Data Migration Test

1. **Add data in localStorage mode**:
   - Stop the backend
   - Add several intake records
   - Export data as backup

2. **Migrate to backend**:
   - Start the backend
   - Refresh the page
   - Check status shows "Backend Connected"
   - Click "Migrate to Backend"
   - Verify success message
   - Check Google Sheets to confirm data

3. **Import from JSON**:
   - Clear localStorage: `localStorage.clear()` in console
   - Use "Choose File" to import the exported JSON
   - Verify all data is restored

### 4. Manual Test Checklist

- [ ] **Data Entry**
  - [ ] Add intake with all fields
  - [ ] Verify required field validation
  - [ ] Check data appears in table
  - [ ] Add output/distillate
  - [ ] Verify remaining inventory calculation

- [ ] **Data Management**
  - [ ] Export data to JSON
  - [ ] Import data from JSON
  - [ ] Migrate localStorage to backend
  - [ ] Verify data in Google Sheets

- [ ] **Error Handling**
  - [ ] Test with backend offline
  - [ ] Verify offline indicator
  - [ ] Add data in offline mode
  - [ ] Bring backend online
  - [ ] Verify data syncs on next save

- [ ] **Browser Compatibility**
  - [ ] Test in Chrome
  - [ ] Test in Firefox
  - [ ] Test in Safari
  - [ ] Test in Edge
  - [ ] Test on mobile device

### 5. Console Testing

Open browser DevTools (F12) and run:

```javascript
// Check backend status
console.log('Backend available:', backendAvailable);
console.log('Backend status:', backendStatus);

// Check data
console.log('Lots:', lots);
console.log('Processes:', processes);
console.log('Shipments:', shipments);

// Test backend connection
checkBackendHealth().then(available => {
    console.log('Backend health check:', available);
});

// Test save to backend
const testLot = {
    id: 'TEST-' + Date.now(),
    category: 'Plant Material',
    quantity: 10,
    unit: 'lbs',
    status: 'active',
    type: 'intake',
    timestamp: new Date().toISOString()
};
saveToBackend('lots', testLot).then(success => {
    console.log('Save test:', success);
});
```

## Integration Testing

### End-to-End Workflow Test

1. **Initial Setup**:
   ```bash
   # Start backend
   python app.py &
   
   # Initialize worksheets
   curl -X POST http://localhost:5000/api/init
   
   # Start frontend server
   python -m http.server 8000 &
   ```

2. **Test Full Workflow**:
   - Open `http://localhost:8000`
   - Add intake: 100 lbs of Flower from Vendor A
   - Verify in Google Sheets "Lots" tab
   - Add output: 20 lbs to DiscountPharms
   - Verify remaining inventory: 80 lbs
   - Export all data
   - Clear browser data
   - Import data back
   - Verify all data restored

3. **Verify Data Persistence**:
   - Restart backend
   - Refresh frontend
   - Verify all data still present
   - Check Google Sheets directly

## Troubleshooting Tests

### Backend Issues

**Test fails with credential errors**:
- Verify `service_account.json` exists
- Check JSON is valid: `python -m json.tool service_account.json`
- Verify Sheet ID is correct
- Check service account has edit access to sheet

**Test fails with import errors**:
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check Python version: `python --version` (should be 3.8+)

### Frontend Issues

**Backend shows offline**:
- Check backend is running: `curl http://localhost:5000/api/health`
- Verify API_BASE_URL in app.js
- Check browser console for CORS errors

**Data not persisting**:
- Check browser console for errors
- Verify localStorage is enabled
- Check backend logs for errors
- Test backend endpoints directly with curl

## Automated Testing (Future)

Consider adding:
- Pytest for backend
- Selenium/Playwright for frontend E2E
- GitHub Actions CI/CD
- Integration test suite
- Performance benchmarks

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/Python version
5. Console/server logs
6. Screenshots if applicable
