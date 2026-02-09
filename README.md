# Thynk Trace

Hemp Traceability System

## Deployment

### Backend Setup (Google Sheets Integration)

1. **Google Sheets API Setup**:
   - Create a Google Cloud Project at https://console.cloud.google.com/
   - Enable the Google Sheets API
   - Create a Service Account: IAM & Admin > Service Accounts > Create Service Account
   - Generate a JSON key and download as `service_account.json`
   - Create a Google Sheet and share it with the service account email (found in the JSON)
   - Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - The backend will automatically create required worksheets: Lots, Processes, Shipments, ChainOfCustody, TestingRecords

2. **Install Backend Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   
   For **local development**, create a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your GOOGLE_SHEET_ID
   ```
   
   For **production deployment**, set these environment variables:
   - `GOOGLE_SHEET_ID`: Your Google Sheet ID
   - `GOOGLE_CREDENTIALS_JSON`: The entire service account JSON as a string
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs (e.g., `https://yourdomain.com,https://www.yourdomain.com`)

4. **Initialize Worksheets**:
   ```bash
   # Start the backend
   python app.py
   
   # In another terminal, initialize worksheets
   curl -X POST http://localhost:5000/api/init
   ```

5. **Run Backend Locally**:
   ```bash
   python app.py
   # Backend will run on http://localhost:5000
   ```

6. **Deploy Backend**:
   
   **Option A: Heroku**
   ```bash
   # Install Heroku CLI
   heroku login
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set GOOGLE_SHEET_ID="your_sheet_id"
   heroku config:set GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'
   heroku config:set ALLOWED_ORIGINS="https://your-frontend.netlify.app"
   
   # Deploy
   git push heroku main
   
   # Initialize worksheets
   curl -X POST https://your-app-name.herokuapp.com/api/init
   ```
   
   **Option B: Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   railway login
   railway init
   
   # Set environment variables in Railway dashboard
   # Deploy
   railway up
   ```
   
   **Option C: Render**
   - Connect your GitHub repository
   - Set environment variables in Render dashboard
   - Deploy automatically on push

7. **Verify Backend Health**:
   ```bash
   # Check if backend is running
   curl https://your-backend-url/api/health
   ```

### Frontend Deployment

1. **Update API Configuration**:
   
   The frontend automatically detects the environment:
   - **Local development**: Uses `http://localhost:5000` when running on localhost
   - **Production**: Uses same origin (relative URLs) when deployed
   
   If you need to use a different backend URL in production, modify `app.js`:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:5000'  // Local development
       : 'https://your-backend-url.com';  // Production - UPDATE THIS
   ```

2. **Deploy to Netlify**:
   ```bash
   # Option 1: Drag and drop
   # Upload index.html, app.js, style.css to Netlify
   
   # Option 2: Connect GitHub
   # Connect your repository to Netlify
   # Build command: (leave empty)
   # Publish directory: /
   ```

3. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   # Follow prompts
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   # Enable GitHub Pages in repository settings
   # Choose branch: main
   # Folder: / (root)
   ```

### Data Migration

1. **Migrate localStorage to Backend**:
   - Open the app in your browser
   - Click "Migrate to Backend" button in the Data Management section
   - Confirm the migration
   - All localStorage data will be transferred to Google Sheets

2. **Import from JSON**:
   - Click "Choose File" under Import Data
   - Select a previously exported JSON file
   - Data will be imported to both localStorage and backend (if available)

3. **Export Data**:
   - Click "Export All Data (JSON)" to download all data
   - Use this for backups or transferring between systems

### Production Checklist

- [ ] Google Sheets API enabled
- [ ] Service account created and JSON key downloaded
- [ ] Google Sheet created and shared with service account
- [ ] Backend deployed with environment variables configured
- [ ] Worksheets initialized (`POST /api/init`)
- [ ] Backend health check passing (`GET /api/health`)
- [ ] Frontend deployed
- [ ] Frontend API URL updated (if using separate backend)
- [ ] CORS configured for production domain
- [ ] Data migration completed (if migrating from localStorage)
- [ ] Test all CRUD operations
- [ ] Verify data persistence in Google Sheets

### Troubleshooting

**Backend Issues:**
- Check backend logs for errors
- Verify service account has edit access to the sheet
- Ensure all environment variables are set correctly
- Test API endpoints with curl or Postman

**Frontend Issues:**
- Open browser console to check for errors
- Verify backend URL is correct
- Check CORS settings if seeing CORS errors
- Ensure backend is running and accessible

**Data Migration:**
- Export data before migration as backup
- Verify backend is online before migrating
- Check browser console for migration errors

## Features

### 🌿 Product Categories
- **Plant Material** - Flower, trim, biomass
- **Concentrates** - Extracts, isolates, distillates
- **Edibles** - Gummies, chocolates, baked goods, beverages
- **Topicals** - Creams, balms, lotions

### 📦 Core Functions

#### 1. Bulk Intake
- Record incoming hemp materials with full details
- Track vendor information, lot IDs, quantities
- Support for cannabinoid profiles
- Automatic chain of custody recording

#### 2. Subdivide Lots
- Break down bulk lots into smaller child lots
- Maintain parent-child relationships
- Automatic quantity tracking
- Validation to prevent over-allocation

#### 3. Process & Convert
Three specialized processing workflows:

**Snowcapping**
- Apply THCa isolate to bulk flower
- Creates premium infused flower
- Tracks both input materials (flower + isolate)
- Records resulting product quantity

**Blending Extracts**
- Combine multiple extracts
- Create custom blends and consistencies
- Support for complex multi-source blending
- Automatic inventory deduction

**Product Conversion**
- Convert bulk materials into finished products
- Support for:
  - Vapes/Cartridges
  - Gummies
  - Pre-rolls
  - Weighed bagged flower
  - Beverages
- Track unit counts and sizes

#### 4. Output/Ship
- Record outbound shipments
- Track recipients and carriers
- Optional tracking numbers
- Maintains chain of custody

#### 5. Inventory View
- Real-time inventory levels
- Filter by category
- Track active vs. depleted lots
- View detailed lot information

#### 6. Reports & Export
- Generate summary reports
- Export all data as JSON
- Chain of custody viewer
- API-ready data format for state system integration

## Technology Stack

- **Frontend**: HTML5, Bootstrap 5, JavaScript (ES6+)
- **Icons**: Bootstrap Icons
- **Storage**: localStorage (browser-based)
- **Design**: Responsive, mobile-friendly interface

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/THYNKINDUSTRIES/Thynk-Tracking.git
cd Thynk-Tracking
```

2. Open `index.html` in a modern web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local web server:
```bash
# Python 3
python -m http.server 8000

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### No Build Process Required

This is a pure client-side application with no dependencies to install. Everything runs in the browser.

## Usage

### 1. Recording Bulk Intake

1. Click **Bulk Intake** from the dashboard
2. Select the material category (Plant Material, Concentrates, etc.)
3. Fill in the intake details:
   - Unique Lot ID
   - Quantity and unit
   - Vendor/source information
   - Optional cannabinoid profile
4. Click **Record Intake**

### 2. Subdividing Lots

1. Click **Subdivide Lots** from the dashboard
2. Select the parent lot you want to subdivide
3. Add child lots with their IDs and quantities
4. System validates that total doesn't exceed parent quantity
5. Click **Complete Subdivision**

### 3. Processing Materials

**Snowcapping Process:**
1. Click **Process/Convert** → Choose **Snowcapping**
2. Select flower lot and isolate lot
3. Enter quantities to use from each
4. Specify output lot ID
5. System creates new infused flower lot

**Blending Extracts:**
1. Click **Process/Convert** → Choose **Blend Extracts**
2. Add multiple source extract lots
3. Specify quantities from each source
4. Enter output blend lot ID and type
5. System creates new blended concentrate

**Product Conversion:**
1. Click **Process/Convert** → Choose **Product Conversion**
2. Select source lot
3. Choose product type (vapes, gummies, etc.)
4. Enter number of units and unit size
5. System creates finished product lot

### 4. Shipping Products

1. Click **Output/Ship** from the dashboard
2. Select lot to ship
3. Enter recipient and shipment details
4. Optionally add tracking information
5. Click **Record Shipment**

### 5. Viewing Inventory

1. Click **Inventory** from the dashboard
2. Use category filters to narrow results
3. Click **View** on any lot for detailed information
4. Monitor active vs. depleted status

### 6. Generating Reports

1. Click **Reports** from the dashboard
2. **Export All Data**: Downloads complete JSON export
3. **Generate Summary**: Creates text-based summary report
4. **Chain of Custody**: Select a lot to view full history

## Data Export Format

The JSON export includes:
- All lot records with full details
- All process records (snowcapping, blending, conversions, subdivisions)
- All shipment records
- Complete chain of custody
- Export metadata (date, version)

This format is designed to be compatible with state traceability systems via API integration.

## Chain of Custody

Every action is automatically recorded:
- Initial intake from vendor
- Subdivision into child lots
- Use in processing (snowcapping, blending, conversion)
- Shipment to customers
- Timestamps for all actions
- Detailed descriptions of each event

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Data Persistence

All data is stored in browser localStorage. Data persists across sessions but is specific to:
- The browser being used
- The domain/origin
- The user profile

**Important Notes:**
- Clearing browser data will delete all records
- Regular exports recommended for backup
- Consider server-based storage for production use

## User-Friendly Design

### For Non-Technical Users

- **Large, Clear Buttons**: Easy to tap on any device
- **Icon-Based Navigation**: Visual cues for all functions
- **Step-by-Step Wizards**: Guided workflows for each task
- **Plain Language**: No technical jargon
- **Visual Feedback**: Clear success/error messages
- **Real-time Validation**: Prevents common errors
- **Responsive Design**: Works on desktop, tablet, and mobile

## Security Considerations

- Client-side only (no server communication)
- Data stored locally in browser
- No authentication required
- Suitable for internal use in trusted environments
- For production, consider:
  - Server-side storage
  - User authentication
  - Access controls
  - Encrypted communications

## Future Enhancements

Potential additions for future versions:
- Server-side storage with database
- Multi-user support with authentication
- Real-time sync across devices
- PDF report generation
- Barcode/QR code scanning
- Photo attachments for lots
- Lab results integration
- Compliance report templates

## License

[Specify your license here]

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: February 2026
