# Configuration Checklist

Use this checklist to ensure your Thynk Tracking system is properly configured.

## ✅ Initial Setup

### Google Cloud Configuration
- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] Service Account created
- [ ] Service Account JSON key downloaded
- [ ] Service Account email noted (for sharing)

### Google Sheets Configuration
- [ ] New Google Sheet created
- [ ] Sheet ID copied from URL
- [ ] Sheet shared with service account email
- [ ] Service account has "Editor" access

### Local Environment Configuration
- [ ] Repository cloned
- [ ] `service_account.json` placed in project root
- [ ] `.env` file created from `.env.example`
- [ ] `GOOGLE_SHEET_ID` set in `.env`
- [ ] `ALLOWED_ORIGINS` configured in `.env`

## ✅ Backend Setup

### Dependencies
- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed from `requirements.txt`
- [ ] All imports working (test with `python -c "from app import app"`)

### Configuration
- [ ] Environment variables loaded
- [ ] Backend can read credentials
- [ ] Backend can connect to Google Sheets
- [ ] Worksheets initialized (`POST /api/init`)

### Testing
- [ ] Backend starts without errors (`python app.py`)
- [ ] Health check returns 200 OK (`curl http://localhost:5000/api/health`)
- [ ] Can create data (`POST /api/lots` with test data)
- [ ] Can read data (`GET /api/lots`)
- [ ] Data appears in Google Sheets

## ✅ Frontend Setup

### Environment
- [ ] Web server running (Python http.server, npx http-server, etc.)
- [ ] Frontend accessible at http://localhost:8000 (or similar)
- [ ] Backend URL configured correctly in `app.js`

### Functionality
- [ ] Page loads without errors (check console F12)
- [ ] Backend status shows "Backend Connected"
- [ ] Can add intake data via form
- [ ] Data persists after page reload
- [ ] Export function works
- [ ] Import function works

## ✅ Data Integration

### Backend Connection
- [ ] Frontend detects backend as available
- [ ] Data saves to both localStorage and backend
- [ ] Chain of custody records created
- [ ] Backend saves complete successfully (check console logs)

### Offline Mode
- [ ] Frontend works when backend is offline
- [ ] Status shows "Offline Mode (localStorage)"
- [ ] Data saves to localStorage only
- [ ] Data syncs to backend when it comes online

### Migration
- [ ] localStorage data can be exported
- [ ] JSON data can be imported
- [ ] Migration to backend function works
- [ ] All data types migrate correctly (lots, processes, shipments, etc.)

## ✅ Production Readiness

### Security
- [ ] Service account credentials secured
- [ ] `.env` file added to `.gitignore`
- [ ] `service_account.json` added to `.gitignore`
- [ ] CORS origins restricted to production domains
- [ ] No sensitive data in code or commits

### Documentation
- [ ] README.md reviewed
- [ ] API.md reviewed for endpoint documentation
- [ ] TESTING.md reviewed for testing procedures
- [ ] QUICKSTART.md reviewed for setup steps

### Deployment
- [ ] Backend deployment platform selected (Heroku/Railway/Render)
- [ ] Frontend deployment platform selected (Netlify/Vercel/GitHub Pages)
- [ ] Production environment variables configured
- [ ] Production backend URL updated in frontend (if separate domains)
- [ ] CORS configured for production frontend URL

### Testing
- [ ] Backend health check accessible
- [ ] All CRUD operations tested
- [ ] Data persists in Google Sheets
- [ ] Frontend UI functions correctly
- [ ] Error handling works (test with backend offline)
- [ ] Browser console shows no errors

## ✅ Monitoring & Maintenance

### Regular Tasks
- [ ] Export data backups regularly
- [ ] Monitor Google Sheets for data integrity
- [ ] Check backend logs for errors
- [ ] Verify service account access still valid
- [ ] Update dependencies periodically

### Troubleshooting Prepared
- [ ] Know how to access backend logs
- [ ] Know how to restart backend
- [ ] Have backup of recent data export
- [ ] Have contact for Google Cloud admin (if applicable)
- [ ] Documented common issues and solutions

## 📋 Quick Verification Commands

Run these to verify everything is working:

```bash
# 1. Check Python version
python --version  # Should be 3.8+

# 2. Check backend imports
python -c "from app import app; print('✓ Backend imports OK')"

# 3. Start backend (in one terminal)
python app.py

# 4. Check health (in another terminal)
curl http://localhost:5000/api/health

# 5. Initialize worksheets
curl -X POST http://localhost:5000/api/init

# 6. Test data creation
curl -X POST http://localhost:5000/api/lots \
  -H "Content-Type: application/json" \
  -d '{"id":"TEST-001","category":"Test","quantity":100,"unit":"lbs","status":"active","type":"intake","timestamp":"2024-01-01T12:00:00Z"}'

# 7. Verify data
curl http://localhost:5000/api/lots

# 8. Start frontend (in another terminal)
python -m http.server 8000

# 9. Open browser
# Navigate to http://localhost:8000
```

## 🎯 Success Criteria

Your system is ready when:
1. ✅ Backend starts without errors
2. ✅ Health check returns healthy status
3. ✅ Frontend shows "Backend Connected"
4. ✅ Can add data via UI
5. ✅ Data appears in Google Sheets
6. ✅ Data persists after page reload
7. ✅ Export/Import functions work
8. ✅ No errors in browser console or backend logs

## 📞 Need Help?

If any items are not checked:
1. Review the relevant documentation (README, API, TESTING, QUICKSTART)
2. Check the troubleshooting sections
3. Review error messages carefully
4. Ensure all prerequisites are met
5. Try the manual testing procedures in TESTING.md

---

**Once all items are checked, your Thynk Tracking system is fully operational! 🎉**
