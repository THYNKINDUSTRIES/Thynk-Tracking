# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Python 3.8+ installed
- A Google account
- A modern web browser

---

## Step 1: Clone the Repository (if not already done)

```bash
git clone https://github.com/THYNKINDUSTRIES/Thynk-Tracking.git
cd Thynk-Tracking
```

---

## Step 2: Set Up Google Sheets API (One-Time Setup)

### 2.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "New Project"
3. Name it "Thynk-Tracking" and click "Create"

### 2.2 Enable Google Sheets API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 2.3 Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name: `thynk-tracking-service`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 2.4 Generate and Download Key
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create" - this downloads `service_account.json`
6. **Move this file to your project root directory**

### 2.5 Create Google Sheet
1. Go to https://sheets.google.com/
2. Create a new spreadsheet
3. Name it "Thynk Tracking Database"
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_SHEET_ID]/edit
   ```
5. Click "Share" and add the service account email (found in your JSON file)
6. Give it "Editor" access

---

## Step 3: Configure Backend

### Quick Setup (Recommended)
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Create .env file template

### Manual Setup (Alternative)
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

### Edit .env File
Open `.env` and add your Sheet ID:
```bash
GOOGLE_SHEET_ID=your_sheet_id_here
ALLOWED_ORIGINS=*
```

---

## Step 4: Start the Backend

```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the backend
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!**

### Initialize Database (First Time Only)
In a new terminal:
```bash
curl -X POST http://localhost:5000/api/init
```

Or visit in browser: http://localhost:5000/api/init

---

## Step 5: Start the Frontend

### Option 1: Simple File Open
- Just open `index.html` in your browser
- Works for basic testing, but may have CORS issues

### Option 2: Local Server (Recommended)
In a new terminal:
```bash
# Python
python -m http.server 8000

# Or Node.js (if installed)
npx http-server -p 8000
```

Open: http://localhost:8000

---

## Step 6: Verify Everything Works

1. **Check Backend Status**
   - Look for green badge: "Backend Connected"
   - If offline, check backend terminal for errors

2. **Add Test Data**
   - Fill in the intake form
   - Add a batch: `TEST-001`
   - Amount: `100` lbs
   - Click "Add Intake"

3. **Verify in Google Sheets**
   - Open your Google Sheet
   - You should see worksheets: Lots, Processes, Shipments, etc.
   - Check the "Lots" worksheet for your test data

4. **Test Export/Import**
   - Click "Export All Data (JSON)"
   - File should download
   - This is your backup!

---

## 🎉 You're Done!

The system is now running with:
- ✅ Backend connected to Google Sheets
- ✅ Frontend with real-time updates
- ✅ Data persisting in the cloud
- ✅ Automatic backups available

---

## Next Steps

### For Production Deployment
See the detailed deployment guide in [README.md](README.md#deployment)

### For Testing
See comprehensive testing guide in [TESTING.md](TESTING.md)

### For API Details
See API documentation in [API.md](API.md)

---

## Troubleshooting

### "Backend not available" showing
- **Check**: Is `python app.py` still running?
- **Check**: Is port 5000 accessible?
- **Fix**: Restart backend: `python app.py`

### "No credentials found" error
- **Check**: Is `service_account.json` in the project root?
- **Check**: Is `GOOGLE_SHEET_ID` set in `.env`?
- **Fix**: Review Step 2 and Step 3

### Data not appearing in Google Sheets
- **Check**: Did you share the sheet with the service account?
- **Check**: Does the service account have "Editor" access?
- **Fix**: Re-share the sheet with correct permissions

### Import errors
- **Check**: Are you in the virtual environment?
- **Check**: Did dependencies install successfully?
- **Fix**: Run `pip install -r requirements.txt` again

### CORS errors in browser
- **Check**: Are you using a local web server?
- **Fix**: Use `python -m http.server 8000` instead of opening file directly

---

## Quick Commands Reference

```bash
# Start backend
python app.py

# Start frontend server
python -m http.server 8000

# Test backend health
curl http://localhost:5000/api/health

# Initialize worksheets
curl -X POST http://localhost:5000/api/init

# View all data
curl http://localhost:5000/api/lots
```

---

## Getting Help

1. Check [TESTING.md](TESTING.md) for detailed troubleshooting
2. Review [README.md](README.md) for complete documentation
3. Check browser console (F12) for frontend errors
4. Check backend terminal for server errors
5. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Your environment (OS, Python version)

---

## Data Safety

**Always keep backups!**
- Export data regularly using "Export All Data (JSON)"
- Data is stored in Google Sheets (automatically backed up by Google)
- Consider daily exports for critical data
- Keep exported JSON files in a safe location

---

**Happy Tracking! 🌿**
