# Thynk Trace

Hemp Traceability System

## Deployment

### Backend Setup (Google Sheets Integration)

1. **Google Sheets API Setup**:
   - Create a Google Cloud Project at https://console.cloud.google.com/
   - Enable the Google Sheets API
   - Create a Service Account: IAM & Admin > Service Accounts > Create Service Account
   - Generate a JSON key and download as `service_account.json`
   - Create a Google Sheet and share it with the service account email
   - Copy the Sheet ID from the URL and update `sheet_id` in `app.py`
   - Create worksheets: Lots, Processes, Shipments, ChainOfCustody, TestingRecords

2. **Install Backend Dependencies**:
   ```
   pip install -r requirements.txt
   ```

3. **Run Backend Locally**:
   ```
   python app.py
   ```

4. **Deploy Backend**:
   - Use Heroku, Railway, or Render
   - Push the code to a Git repo
   - Set up the service account key as an environment variable or file

### Frontend Deployment

1. **Deploy to Netlify/Vercel**:
   - Upload the `index.html`, `app.js`, `style.css` files
   - Or connect the GitHub repo
   - Update API calls in `app.js` to point to the backend URL (e.g., change `/api/` to `https://your-backend-url/api/`)

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
