"""
Smart Import Module - AI-Driven Data Import with Header Recognition
This module provides intelligent data import capabilities with automatic
header recognition, fuzzy matching, and error minimization.
"""

import pandas as pd
from fuzzywuzzy import fuzz, process
from typing import Dict, List, Tuple, Any
import json


class SmartImporter:
    """
    Intelligent data importer with automatic header recognition and mapping.
    """
    
    # Define the target schema for each data type
    SCHEMAS = {
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
                'id': ['lot id', 'lot_id', 'lotid', 'batch id', 'batch_id', 'batchid', 'identifier'],
                'quantity': ['qty', 'amount', 'weight', 'count', 'volume'],
                'unit': ['uom', 'unit of measure', 'measurement', 'units'],
                'category': ['product category', 'type', 'product_type', 'material'],
                'lotIdentifier': ['lot identifier', 'lot number', 'lot #', 'batch number'],
                'productType': ['product type', 'product', 'item type'],
                'productSKU': ['sku', 'product sku', 'product code', 'item code'],
                'invoiceNum': ['invoice', 'invoice number', 'invoice #', 'invoice_number'],
                'invoiceDate': ['invoice date', 'date', 'purchase date'],
                'customerName': ['customer', 'customer name', 'client', 'buyer'],
                'vendor': ['supplier', 'source', 'vendor name'],
                'cannabinoidProfile': ['cannabinoids', 'profile', 'thc', 'cbd', 'potency'],
                'notes': ['comments', 'remarks', 'description', 'note'],
                'stateCheck': ['state check', 'compliance', 'status', 'pass/fail'],
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
                'shipToName': ['recipient', 'ship to name', 'customer name', 'consignee'],
                'shipToAddress': ['address', 'ship to address', 'delivery address', 'street'],
                'shipToCity': ['city', 'ship to city'],
                'shipToState': ['state', 'ship to state', 'province'],
                'shipToZIP': ['zip', 'zipcode', 'zip code', 'postal code'],
                'pricePerUOM': ['price', 'unit price', 'price per unit', 'cost'],
                'extendedTotal': ['total', 'extended total', 'amount', 'total price'],
            }
        }
    }
    
    def __init__(self, data_type='lots'):
        """
        Initialize the smart importer for a specific data type.
        
        Args:
            data_type: Type of data to import ('lots' or 'shipments')
        """
        self.data_type = data_type
        self.schema = self.SCHEMAS.get(data_type, self.SCHEMAS['lots'])
        self.confidence_threshold = 60  # Minimum fuzzy match score
    
    def read_file(self, file_path: str) -> pd.DataFrame:
        """
        Read data from various file formats (CSV, Excel, JSON).
        
        Args:
            file_path: Path to the file to import
            
        Returns:
            DataFrame containing the imported data
        """
        file_extension = file_path.lower().split('.')[-1]
        
        try:
            if file_extension == 'csv':
                # Try different encodings and delimiters
                try:
                    df = pd.read_csv(file_path)
                except:
                    try:
                        df = pd.read_csv(file_path, encoding='latin-1')
                    except:
                        df = pd.read_csv(file_path, delimiter=';')
            elif file_extension in ['xlsx', 'xls']:
                df = pd.read_excel(file_path, engine='openpyxl' if file_extension == 'xlsx' else None)
            elif file_extension == 'json':
                df = pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            return df
        except Exception as e:
            raise Exception(f"Error reading file: {str(e)}")
    
    def map_headers(self, source_headers: List[str]) -> Dict[str, Any]:
        """
        Intelligently map source headers to target schema fields using fuzzy matching.
        
        Args:
            source_headers: List of column names from the source data
            
        Returns:
            Dictionary containing mapping results with confidence scores
        """
        mapping = {}
        unmapped_headers = []
        
        # Normalize source headers
        normalized_headers = {h: h.lower().strip() for h in source_headers}
        
        # Create a list of all possible target fields
        all_target_fields = self.schema['required'] + self.schema['optional']
        
        # Build reverse alias lookup
        field_to_aliases = {}
        for field, aliases in self.schema.get('aliases', {}).items():
            field_to_aliases[field] = [field.lower()] + [a.lower() for a in aliases]
        
        # Add fields without explicit aliases
        for field in all_target_fields:
            if field not in field_to_aliases:
                field_to_aliases[field] = [field.lower()]
        
        # Map each source header to the best matching target field
        for source_header in source_headers:
            normalized = normalized_headers[source_header]
            best_match = None
            best_score = 0
            best_field = None
            
            # Try to find the best match
            for target_field, aliases in field_to_aliases.items():
                for alias in aliases:
                    # Use fuzzy matching
                    score = fuzz.ratio(normalized, alias)
                    
                    # Also try token sort ratio for better partial matches
                    token_score = fuzz.token_sort_ratio(normalized, alias)
                    max_score = max(score, token_score)
                    
                    if max_score > best_score:
                        best_score = max_score
                        best_match = alias
                        best_field = target_field
            
            # Only map if confidence is above threshold
            if best_score >= self.confidence_threshold:
                mapping[source_header] = {
                    'target_field': best_field,
                    'confidence': best_score,
                    'matched_alias': best_match,
                    'is_required': best_field in self.schema['required']
                }
            else:
                unmapped_headers.append(source_header)
        
        # Check for missing required fields
        mapped_required = [m['target_field'] for m in mapping.values() if m['is_required']]
        missing_required = [f for f in self.schema['required'] if f not in mapped_required]
        
        return {
            'mapping': mapping,
            'unmapped_headers': unmapped_headers,
            'missing_required': missing_required,
            'success': len(missing_required) == 0
        }
    
    def transform_data(self, df: pd.DataFrame, mapping: Dict[str, Dict]) -> List[Dict]:
        """
        Transform source data to target schema using the provided mapping.
        
        Args:
            df: Source DataFrame
            mapping: Header mapping from map_headers()
            
        Returns:
            List of dictionaries in target schema format
        """
        transformed_data = []
        
        # Create reverse mapping (source -> target)
        source_to_target = {
            source: info['target_field'] 
            for source, info in mapping.items()
        }
        
        # Transform each row
        for _, row in df.iterrows():
            record = {}
            
            for source_col, target_field in source_to_target.items():
                value = row[source_col]
                
                # Skip NaN values
                if pd.isna(value):
                    continue
                
                # Convert to appropriate type
                if isinstance(value, (int, float)):
                    record[target_field] = float(value) if '.' in str(value) else int(value)
                else:
                    record[target_field] = str(value).strip()
            
            # Add default values for required fields if missing
            if self.data_type == 'lots':
                if 'id' not in record:
                    record['id'] = f"LOT-IMPORT-{len(transformed_data)}"
                if 'status' not in record:
                    record['status'] = 'active'
                if 'type' not in record:
                    record['type'] = 'intake'
                if 'originalQuantity' not in record and 'quantity' in record:
                    record['originalQuantity'] = record['quantity']
            
            transformed_data.append(record)
        
        return transformed_data
    
    def validate_data(self, data: List[Dict]) -> Dict[str, Any]:
        """
        Validate transformed data for errors and inconsistencies.
        
        Args:
            data: List of transformed records
            
        Returns:
            Dictionary containing validation results
        """
        errors = []
        warnings = []
        
        for idx, record in enumerate(data):
            row_num = idx + 1
            
            # Check required fields
            for field in self.schema['required']:
                if field not in record or not record[field]:
                    errors.append(f"Row {row_num}: Missing required field '{field}'")
            
            # Validate specific fields
            if 'quantity' in record:
                try:
                    qty = float(record['quantity'])
                    if qty < 0:
                        errors.append(f"Row {row_num}: Quantity cannot be negative")
                except (ValueError, TypeError):
                    errors.append(f"Row {row_num}: Invalid quantity value")
            
            # Check for duplicate IDs
            if 'id' in record:
                duplicates = [r for r in data if r.get('id') == record['id']]
                if len(duplicates) > 1:
                    warnings.append(f"Row {row_num}: Duplicate ID '{record['id']}' found")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'total_records': len(data)
        }
    
    def import_file(self, file_path: str, user_mapping: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Complete import process: read, map, transform, and validate.
        
        Args:
            file_path: Path to file to import
            user_mapping: Optional manual mapping overrides (source_header -> target_field)
            
        Returns:
            Dictionary containing import results
        """
        try:
            # Step 1: Read file
            df = self.read_file(file_path)
            
            # Step 2: Map headers
            mapping_result = self.map_headers(df.columns.tolist())
            
            # Apply user mapping overrides if provided
            if user_mapping:
                for source, target in user_mapping.items():
                    if source in df.columns:
                        mapping_result['mapping'][source] = {
                            'target_field': target,
                            'confidence': 100,
                            'matched_alias': 'user_defined',
                            'is_required': target in self.schema['required']
                        }
            
            # Step 3: Transform data
            transformed_data = self.transform_data(df, mapping_result['mapping'])
            
            # Step 4: Validate data
            validation_result = self.validate_data(transformed_data)
            
            return {
                'success': mapping_result['success'] and validation_result['valid'],
                'data': transformed_data,
                'mapping': mapping_result,
                'validation': validation_result,
                'preview': transformed_data[:5] if len(transformed_data) > 5 else transformed_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': [],
                'mapping': {},
                'validation': {'valid': False, 'errors': [str(e)], 'warnings': []}
            }


def analyze_import_file(file_path: str, data_type: str = 'lots') -> Dict[str, Any]:
    """
    Analyze an import file and return mapping suggestions without importing.
    
    Args:
        file_path: Path to file to analyze
        data_type: Type of data ('lots' or 'shipments')
        
    Returns:
        Analysis results with suggested mappings
    """
    importer = SmartImporter(data_type)
    
    try:
        df = importer.read_file(file_path)
        mapping_result = importer.map_headers(df.columns.tolist())
        
        return {
            'success': True,
            'source_headers': df.columns.tolist(),
            'row_count': len(df),
            'mapping_suggestions': mapping_result,
            'preview_data': df.head(3).to_dict('records')
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
