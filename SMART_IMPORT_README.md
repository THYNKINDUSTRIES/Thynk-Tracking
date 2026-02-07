# Smart Import Feature - AI-Driven Data Import

## Overview

The Smart Import feature provides an intelligent, AI-driven data import system that dramatically reduces the tedious nature of data migration. It automatically recognizes headers, maps columns intelligently, and minimizes errors through advanced validation.

## Key Features

### 🤖 AI-Powered Header Recognition
- **Automatic Column Mapping**: Intelligently matches your file's column names to the system's expected fields
- **Fuzzy Matching**: Recognizes variations in naming (e.g., "Lot ID" = "LotIdentifier" = "Batch ID")
- **High Confidence Scores**: Shows how confident the system is about each mapping (60%+ threshold)

### 📊 Multiple File Format Support
- **CSV Files**: Standard comma-separated values
- **Excel Files**: .xlsx and .xls formats (requires backend)
- **JSON Files**: Array of objects

### 👁️ Preview Before Import
- **Data Preview**: See the first 3 rows of your data before importing
- **Mapping Review**: Review and adjust column mappings if needed
- **Confidence Indicators**: Visual feedback on mapping quality

### ✅ Error Minimization
- **Pre-Import Validation**: Checks for required fields and data types
- **Duplicate Detection**: Warns about duplicate IDs
- **Data Type Validation**: Ensures quantities are numbers, dates are valid, etc.
- **Clear Error Messages**: Specific row-level error reporting

## How to Use

### Step 1: Prepare Your Data

Create a file (CSV, Excel, or JSON) with your data. The system will automatically recognize common column names:

**For Lots/Inventory:**
- ID fields: "Lot ID", "Batch ID", "Identifier", "Lot Identifier"
- Quantity: "Qty", "Amount", "Weight", "Volume"
- Unit: "UOM", "Unit of Measure", "Units"
- Product Type: "Product Type", "Category", "Material"
- And many more...

**Example CSV:**
```csv
Lot Identifier,Product Type,Qty,UOM,Customer,Invoice #,Vendor,Notes
BATCH-001,Flower,100,lbs,ABC Company,INV-001,Green Farms,Premium quality
LOT-002,Extract,50,kg,XYZ Corp,INV-002,Mountain Extracts,High grade
```

### Step 2: Open Smart Import

1. Click the **"AI-Powered Smart Import"** button on the main page
2. Select the data type (Lots/Inventory or Shipments)
3. Choose your file
4. Click **"Analyze File"**

### Step 3: Review Mapping

The system will:
- Analyze your file's headers
- Automatically map them to the correct fields
- Show confidence scores for each mapping
- Display a preview of your data
- Highlight any missing required fields or unmapped columns

**Confidence Scores:**
- 🟢 Green (80%+): High confidence match
- 🟡 Yellow (60-79%): Medium confidence match
- 🔴 Red (<60%): Low confidence (not mapped)

### Step 4: Import Data

1. Review the mappings and preview
2. Click **"Import Data"**
3. System validates all data
4. Data is imported to your inventory
5. View results and any warnings

## Supported Field Mappings

### Lots/Inventory Fields

**Required:**
- `id` (Lot ID, Batch ID, Identifier)
- `quantity` (Qty, Amount, Weight)
- `unit` (UOM, Units)

**Optional:**
- Product information: Product Type, SKU, Category
- Invoice data: Invoice #, Invoice Date, Customer Name
- Quality: Cannabinoid Profile, COA Link, State Check
- Metadata: Vendor, Notes, Timestamps

### Shipment Fields

**Required:**
- `lotId` (Lot ID, Batch ID)
- `date` (Ship Date, Shipment Date)

**Optional:**
- Tracking: Tracking #, Carrier
- Recipient: Ship-To Name, Address, City, State, ZIP
- Financial: Price, Extended Total, Payment Status
- Compliance: Packet Complete, License Copy, etc.

## Examples

### Example 1: Basic Lot Import

**Input CSV:**
```csv
Batch,Amount,Unit,Type
BATCH-001,100,lbs,Flower
BATCH-002,50,kg,Extract
```

**Result:**
- ✅ "Batch" → `id` (100% confidence)
- ✅ "Amount" → `quantity` (95% confidence)
- ✅ "Unit" → `unit` (100% confidence)
- ✅ "Type" → `category` (90% confidence)

### Example 2: Complex Master Ledger Import

**Input CSV:**
```csv
Invoice #,Monday Item ID,Invoice Date,Customer Name,Product / SKU,Lot Identifier,Qty,UOM,Ship-To Name,Ship-To City,Ship-To State,Tracking #
INV-001,MON-123,2024-01-15,ABC Corp,FLOWER-001,LOT-2024-001,100,lbs,John Doe,Denver,CO,1Z999AA10123456784
```

**Result:**
- All columns automatically mapped to correct fields
- Lot and shipment data both imported
- Chain of custody automatically recorded

## Technical Details

### Fuzzy Matching Algorithm

The system uses Levenshtein distance-based fuzzy matching to calculate similarity between source headers and target fields:

1. Normalizes all headers to lowercase
2. Compares against field names and all known aliases
3. Calculates similarity score (0-100%)
4. Selects best match above confidence threshold (60%)

### Validation Rules

**Quantity Validation:**
- Must be a valid number
- Cannot be negative
- Converted to appropriate numeric type

**Required Fields:**
- All required fields must be present or mappable
- Missing required fields prevent import

**Duplicate Detection:**
- Checks for duplicate IDs within the import
- Warns but does not prevent import

### Data Storage

- **Client-Side Only**: All data stored in browser localStorage
- **No Server Required**: Works completely offline
- **Instant Import**: No network delays
- **Privacy**: Your data never leaves your browser

## Troubleshooting

### "No file selected" error
- Make sure to select a file before clicking Analyze

### "Missing required field" error
- Ensure your file has columns for: ID, Quantity, and Unit (for lots)
- Check that column names are recognizable (see supported mappings)
- Manually add missing data to your file

### "Invalid file format" error
- Ensure file is CSV, JSON, or Excel format
- For Excel files, convert to CSV for client-side import
- Check file encoding (UTF-8 recommended)

### Low confidence mappings
- System couldn't confidently match a column
- Review the mapping and verify it's correct
- Consider renaming columns to standard names

### "Error reading file" error
- Check file format and encoding
- Ensure file is not corrupted
- Try converting to CSV

## Best Practices

1. **Use Standard Column Names**: Use common names like "Lot ID", "Quantity", "UOM"
2. **Include All Required Fields**: Always include ID, Quantity, and Unit columns
3. **Clean Your Data**: Remove empty rows and columns
4. **Review Before Import**: Always check the preview and mappings
5. **Start Small**: Test with a few rows before importing large files
6. **Keep Backups**: Export your existing data before large imports

## Advanced Features

### Custom Aliases

The system recognizes hundreds of common variations:
- "Lot ID" = "Lot Identifier" = "LotID" = "Batch ID" = "Batch Number"
- "Qty" = "Quantity" = "Amount" = "Weight" = "Count"
- And many more...

### Multi-Format Support

Import from different source systems:
- Master ledgers
- ERP exports
- Spreadsheet templates
- Monday.com exports
- Custom formats

### Chain of Custody

All imports are automatically recorded in the chain of custody with:
- Import timestamp
- Source filename
- Number of records imported
- Complete import data

## Future Enhancements

Potential future improvements:
- Excel file support without backend
- Column mapping memory (remember your mappings)
- Import templates for common formats
- Batch import from multiple files
- Field mapping customization UI
- Import scheduling and automation

## Support

For issues or questions:
1. Check this documentation
2. Review the sample-import.csv file
3. Open an issue on GitHub
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Compatibility**: All modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
