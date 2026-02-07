/**
 * Smart Import Module - Client-Side Only Version
 * AI-Driven Data Import with Header Recognition (No Backend Required)
 * Uses localStorage for data persistence
 */

class ClientSmartImport {
    constructor() {
        this.currentFile = null;
        this.analysisResult = null;
        this.dataType = 'lots';
        this.userMappings = {};
        this.confidenceThreshold = 60;
        
        // Define schemas matching the app's data structure
        this.schemas = {
            'lots': {
                'required': ['id', 'quantity', 'unit'],
                'optional': [
                    'category', 'type', 'status', 'lotIdentifier', 'productType',
                    'productSKU', 'invoiceNum', 'invoiceDate', 'customerName',
                    'mondayItemId', 'mondayLink', 'coaLink', 'coaMatchVerified',
                    'stateCheck', 'checkedBy', 'checkedDate', 'thynkBrainConsulted',
                    'thynkBrainNotes', 'notes', 'vendor', 'cannabinoidProfile',
                    'originalQuantity', 'timestamp'
                ],
                'aliases': {
                    'id': ['lot id', 'lot_id', 'lotid', 'batch id', 'batch_id', 'batchid', 'identifier', 'lot identifier'],
                    'quantity': ['qty', 'amount', 'weight', 'count', 'volume'],
                    'unit': ['uom', 'unit of measure', 'measurement', 'units'],
                    'category': ['product category', 'type', 'product_type', 'material'],
                    'lotIdentifier': ['lot identifier', 'lot number', 'lot #', 'batch number'],
                    'productType': ['product type', 'product', 'item type'],
                    'productSKU': ['sku', 'product sku', 'product code', 'item code', 'product / sku'],
                    'invoiceNum': ['invoice', 'invoice number', 'invoice #', 'invoice_number'],
                    'invoiceDate': ['invoice date', 'date', 'purchase date'],
                    'customerName': ['customer', 'customer name', 'client', 'buyer'],
                    'vendor': ['supplier', 'source', 'vendor name'],
                    'cannabinoidProfile': ['cannabinoids', 'profile', 'thc', 'cbd', 'potency', 'cannabinoid profile'],
                    'notes': ['comments', 'remarks', 'description', 'note', 'notes / exception flag'],
                    'stateCheck': ['state check', 'compliance', 'pass/fail', 'state check (pass/fail/confirm)'],
                    'coaLink': ['coa', 'coa link', 'certificate', 'lab results'],
                }
            },
            'shipments': {
                'required': ['lotId', 'date'],
                'optional': [
                    'tracking', 'carrier', 'shipToName', 'shipToAddress', 'shipToCity',
                    'shipToState', 'shipToZIP', 'upsWebGateId', 'routing', 'pricePerUOM',
                    'extendedTotal', 'paymentStatus', 'packetComplete', 'carrierLetter',
                    'licenseCopy', 'countVerified', 'finalSignOff', 'archiveLink', 'timestamp'
                ],
                'aliases': {
                    'lotId': ['lot id', 'lot_id', 'batch id', 'batch_id', 'lot identifier'],
                    'date': ['ship date', 'shipping date', 'shipment date', 'sent date'],
                    'tracking': ['tracking number', 'tracking #', 'tracking_number', 'track'],
                    'carrier': ['shipper', 'shipping carrier', 'delivery service'],
                    'shipToName': ['recipient', 'ship to name', 'customer name', 'consignee', 'ship-to name'],
                    'shipToAddress': ['address', 'ship to address', 'delivery address', 'street', 'ship-to address'],
                    'shipToCity': ['city', 'ship to city', 'ship-to city'],
                    'shipToState': ['state', 'ship to state', 'province', 'ship-to state'],
                    'shipToZIP': ['zip', 'zipcode', 'zip code', 'postal code', 'ship-to zip'],
                    'pricePerUOM': ['price', 'unit price', 'price per unit', 'cost', 'price / uom'],
                    'extendedTotal': ['total', 'extended total', 'amount', 'total price'],
                }
            }
        };
    }

    /**
     * Calculate fuzzy string similarity (Levenshtein distance based)
     */
    similarity(s1, s2) {
        s1 = s1.toLowerCase().trim();
        s2 = s2.toLowerCase().trim();
        
        if (s1 === s2) return 100;
        
        // Calculate Levenshtein distance
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        
        if (longer.length === 0) return 100;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return Math.round((1 - editDistance / longer.length) * 100);
    }

    /**
     * Levenshtein distance calculation
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Map source headers to target schema
     */
    mapHeaders(sourceHeaders) {
        const schema = this.schemas[this.dataType];
        const mapping = {};
        const unmappedHeaders = [];
        
        // Build reverse alias lookup
        const fieldToAliases = {};
        const allFields = [...schema.required, ...schema.optional];
        
        allFields.forEach(field => {
            fieldToAliases[field] = [field.toLowerCase()];
            if (schema.aliases && schema.aliases[field]) {
                fieldToAliases[field].push(...schema.aliases[field].map(a => a.toLowerCase()));
            }
        });
        
        // Map each source header
        sourceHeaders.forEach(sourceHeader => {
            const normalized = sourceHeader.toLowerCase().trim();
            let bestMatch = null;
            let bestScore = 0;
            let bestField = null;
            
            // Try to find best match
            for (const [targetField, aliases] of Object.entries(fieldToAliases)) {
                for (const alias of aliases) {
                    const score = this.similarity(normalized, alias);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = alias;
                        bestField = targetField;
                    }
                }
            }
            
            // Only map if confidence is above threshold
            if (bestScore >= this.confidenceThreshold) {
                mapping[sourceHeader] = {
                    target_field: bestField,
                    confidence: bestScore,
                    matched_alias: bestMatch,
                    is_required: schema.required.includes(bestField)
                };
            } else {
                unmappedHeaders.push(sourceHeader);
            }
        });
        
        // Check for missing required fields
        const mappedRequired = Object.values(mapping)
            .filter(m => m.is_required)
            .map(m => m.target_field);
        const missingRequired = schema.required.filter(f => !mappedRequired.includes(f));
        
        return {
            mapping: mapping,
            unmapped_headers: unmappedHeaders,
            missing_required: missingRequired,
            success: missingRequired.length === 0
        };
    }

    /**
     * Parse CSV text into array of objects
     */
    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];
        
        const headers = this.parseCSVLine(lines[0]);
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === 0 || values.every(v => !v)) continue;
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        
        return data;
    }

    /**
     * Parse a single CSV line (handles quoted values)
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    /**
     * Read file and parse into data
     */
    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const fileName = file.name.toLowerCase();
            
            reader.onload = (e) => {
                try {
                    let data = [];
                    
                    if (fileName.endsWith('.csv')) {
                        data = this.parseCSV(e.target.result);
                    } else if (fileName.endsWith('.json')) {
                        const parsed = JSON.parse(e.target.result);
                        data = Array.isArray(parsed) ? parsed : [parsed];
                    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                        reject(new Error('Excel files require backend processing. Please convert to CSV first.'));
                        return;
                    } else {
                        reject(new Error('Unsupported file format'));
                        return;
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    /**
     * Analyze uploaded file
     */
    async analyzeFile(file, dataType) {
        this.currentFile = file;
        this.dataType = dataType;
        
        try {
            const data = await this.readFile(file);
            
            if (data.length === 0) {
                throw new Error('File contains no data');
            }
            
            const sourceHeaders = Object.keys(data[0]);
            const mappingResult = this.mapHeaders(sourceHeaders);
            
            return {
                success: true,
                source_headers: sourceHeaders,
                row_count: data.length,
                mapping_suggestions: mappingResult,
                preview_data: data.slice(0, 3),
                _fullData: data  // Store for later use
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Transform data using mapping
     */
    transformData(data, mapping) {
        const transformed = [];
        
        const sourceToTarget = {};
        Object.entries(mapping).forEach(([source, info]) => {
            sourceToTarget[source] = info.target_field;
        });
        
        data.forEach((row, index) => {
            const record = {};
            
            // Map fields
            Object.entries(sourceToTarget).forEach(([source, target]) => {
                const value = row[source];
                if (value !== undefined && value !== null && value !== '') {
                    record[target] = value;
                }
            });
            
            // Add defaults for lots
            if (this.dataType === 'lots') {
                if (!record.id) {
                    record.id = `LOT-IMPORT-${Date.now()}-${index}`;
                }
                if (!record.status) {
                    record.status = 'active';
                }
                if (!record.type) {
                    record.type = 'intake';
                }
                if (!record.originalQuantity && record.quantity) {
                    record.originalQuantity = record.quantity;
                }
                if (!record.timestamp) {
                    record.timestamp = new Date().toISOString();
                }
            }
            
            transformed.push(record);
        });
        
        return transformed;
    }

    /**
     * Validate transformed data
     */
    validateData(data) {
        const schema = this.schemas[this.dataType];
        const errors = [];
        const warnings = [];
        
        data.forEach((record, index) => {
            const rowNum = index + 1;
            
            // Check required fields
            schema.required.forEach(field => {
                if (!record[field]) {
                    errors.push(`Row ${rowNum}: Missing required field '${field}'`);
                }
            });
            
            // Validate quantity
            if (record.quantity !== undefined) {
                const qty = parseFloat(record.quantity);
                if (isNaN(qty)) {
                    errors.push(`Row ${rowNum}: Invalid quantity value`);
                } else if (qty < 0) {
                    errors.push(`Row ${rowNum}: Quantity cannot be negative`);
                }
            }
        });
        
        // Check for duplicate IDs
        const ids = data.map(r => r.id).filter(Boolean);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
            warnings.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            total_records: data.length
        };
    }

    /**
     * Execute full import
     */
    async executeImport(analysisResult, userMapping = {}) {
        try {
            const data = analysisResult._fullData;
            if (!data) {
                throw new Error('No data available for import');
            }
            
            // Merge user mapping with auto mapping
            const finalMapping = { ...analysisResult.mapping_suggestions.mapping, ...userMapping };
            
            // Transform data
            const transformed = this.transformData(data, finalMapping);
            
            // Validate
            const validation = this.validateData(transformed);
            
            if (!validation.valid) {
                return {
                    success: false,
                    validation: validation,
                    data: []
                };
            }
            
            // Save to localStorage
            if (this.dataType === 'lots') {
                const existingLots = JSON.parse(localStorage.getItem('lots') || '[]');
                const merged = [...existingLots, ...transformed];
                localStorage.setItem('lots', JSON.stringify(merged));
                
                // Add to chain of custody
                transformed.forEach(lot => {
                    this.addToChainOfCustody(lot.id, 'Import', `Imported from ${this.currentFile.name}`, lot);
                });
            } else if (this.dataType === 'shipments') {
                const existingShipments = JSON.parse(localStorage.getItem('shipments') || '[]');
                const merged = [...existingShipments, ...transformed];
                localStorage.setItem('shipments', JSON.stringify(merged));
            }
            
            return {
                success: true,
                data: transformed,
                validation: validation
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                validation: { valid: false, errors: [error.message], warnings: [] }
            };
        }
    }

    /**
     * Add to chain of custody
     */
    addToChainOfCustody(lotId, action, description, data) {
        const chainOfCustody = JSON.parse(localStorage.getItem('chainOfCustody') || '[]');
        chainOfCustody.push({
            lotId: lotId,
            action: action,
            description: description,
            data: data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('chainOfCustody', JSON.stringify(chainOfCustody));
    }
}

// Export for use in other modules
window.ClientSmartImport = ClientSmartImport;
