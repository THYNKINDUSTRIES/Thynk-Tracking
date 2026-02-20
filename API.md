# API Documentation

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: Your deployed backend URL

## Authentication
No authentication required for current implementation. In production, consider adding API keys or OAuth.

## Endpoints

### Health Check
Check if the backend is running and connected to Google Sheets.

**GET** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "message": "Backend is running and connected to Google Sheets",
  "sheet_title": "Your Sheet Name"
}
```

**Error Response:**
```json
{
  "status": "unhealthy",
  "message": "Error message"
}
```

---

### Initialize Worksheets
Create all required worksheets in the Google Sheet.

**POST** `/api/init`

**Response:**
```json
{
  "message": "Worksheets initialized successfully"
}
```

---

### Lots

#### Get All Lots
**GET** `/api/lots`

**Response:**
```json
[
  {
    "id": "LOT-001",
    "category": "Plant Material",
    "quantity": 100,
    "unit": "lbs",
    "status": "active",
    ...
  }
]
```

#### Create Lot
**POST** `/api/lots`

**Request Body:**
```json
{
  "id": "LOT-001",
  "category": "Plant Material",
  "quantity": 100,
  "unit": "lbs",
  "date": "2024-01-01",
  "vendor": "Vendor Name",
  "productType": "Flower",
  "status": "active",
  "type": "intake",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "message": "Lot added"
}
```

#### Update Lot
**PUT** `/api/lots`

**Request Body:**
```json
{
  "id": "LOT-001",
  "quantity": 80,
  ...
}
```

**Response:**
```json
{
  "message": "Lot updated"
}
```

#### Delete Lot
**DELETE** `/api/lots?id=LOT-001`

**Response:**
```json
{
  "message": "Lot deleted"
}
```

---

### Processes

#### Get All Processes
**GET** `/api/processes`

**Response:**
```json
[
  {
    "id": "process_123",
    "type": "snowcapping",
    "inputs": "[{\"lotId\":\"LOT-001\",\"quantity\":10}]",
    "outputs": "LOT-002",
    "date": "2024-01-01",
    "timestamp": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Process
**POST** `/api/processes`

**Request Body:**
```json
{
  "id": "process_123",
  "type": "snowcapping",
  "inputs": "[{\"lotId\":\"LOT-001\",\"quantity\":10}]",
  "outputs": "LOT-002",
  "date": "2024-01-01",
  "notes": "Process notes",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### Shipments

#### Get All Shipments
**GET** `/api/shipments`

**Response:**
```json
[
  {
    "id": "SHIP-001",
    "lotId": "LOT-001",
    "date": "2024-01-01",
    "recipient": "Customer Name",
    "quantity": 10,
    "carrier": "UPS",
    "trackingNumber": "1Z999AA10123456784",
    "timestamp": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Shipment
**POST** `/api/shipments`

**Request Body:**
```json
{
  "id": "SHIP-001",
  "lotId": "LOT-001",
  "date": "2024-01-01",
  "recipient": "Customer Name",
  "quantity": 10,
  "carrier": "UPS",
  "trackingNumber": "1Z999AA10123456784",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### Chain of Custody

#### Get All CoC Records
**GET** `/api/chainOfCustody`

**Response:**
```json
[
  {
    "id": "coc_123",
    "lotId": "LOT-001",
    "action": "intake",
    "description": "Received from vendor",
    "details": "{...}",
    "timestamp": "2024-01-01T12:00:00Z"
  }
]
```

#### Create CoC Record
**POST** `/api/chainOfCustody`

**Request Body:**
```json
{
  "id": "coc_123",
  "lotId": "LOT-001",
  "action": "intake",
  "description": "Received from vendor",
  "details": "{...}",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### Testing Records

#### Get All Testing Records
**GET** `/api/testingRecords`

**Response:**
```json
[
  {
    "id": "test_123",
    "lotId": "LOT-001",
    "testType": "State Check",
    "date": "2024-01-01",
    "results": "PASS",
    "labName": "Lab Name",
    "timestamp": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Testing Record
**POST** `/api/testingRecords`

**Request Body:**
```json
{
  "id": "test_123",
  "lotId": "LOT-001",
  "testType": "State Check",
  "date": "2024-01-01",
  "results": "PASS",
  "labName": "Lab Name",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## CORS

The backend is configured to accept requests from:
- Development: All origins (`*`)
- Production: Configured via `ALLOWED_ORIGINS` environment variable

---

## Rate Limiting

No rate limiting currently implemented. Consider adding rate limiting for production use.

---

## Data Format Notes

1. **IDs**: Use unique identifiers for all records
2. **Timestamps**: ISO 8601 format (e.g., `2024-01-01T12:00:00Z`)
3. **Arrays in Sheets**: Complex data (inputs, details) stored as JSON strings
4. **Dates**: Use ISO date format (`YYYY-MM-DD`)

---

## Testing

Use curl to test endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all lots
curl http://localhost:5000/api/lots

# Create a lot
curl -X POST http://localhost:5000/api/lots \
  -H "Content-Type: application/json" \
  -d '{"id":"LOT-001","category":"Plant Material","quantity":100,"unit":"lbs","status":"active","type":"intake","timestamp":"2024-01-01T12:00:00Z"}'
```
