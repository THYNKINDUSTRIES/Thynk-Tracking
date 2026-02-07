/**
 * Smart Import Module - Frontend
 * AI-Driven Data Import with Header Recognition and Preview
 * Client-Side Only Version (works with localStorage)
 */

class SmartImportUI {
    constructor() {
        this.currentFile = null;
        this.analysisResult = null;
        this.dataType = 'lots';
        this.userMappings = {};
        this.importer = new ClientSmartImport();
    }

    /**
     * Initialize the smart import UI
     */
    init() {
        this.createImportModal();
        this.attachEventListeners();
    }

    /**
     * Create the import modal HTML
     */
    createImportModal() {
        const modalHTML = `
            <div class="modal fade" id="smartImportModal" tabindex="-1" style="display: none;">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-cloud-upload"></i> Smart Data Import
                            </h5>
                            <button type="button" class="btn-close btn-close-white" onclick="window.smartImportUI.close()"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Step 1: File Upload -->
                            <div id="importStep1" class="import-step">
                                <h6 class="mb-3">Step 1: Upload File</h6>
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle"></i>
                                    <strong>AI-Powered Import:</strong> Upload your data file (CSV, Excel, or JSON).
                                    Our system will automatically recognize headers and map them to the correct fields!
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Select Data Type:</label>
                                    <select class="form-select" id="importDataType">
                                        <option value="lots">Lots/Inventory</option>
                                        <option value="shipments">Shipments</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="importFileInput" class="form-label">Choose File:</label>
                                    <input type="file" class="form-control" id="importFileInput" 
                                           accept=".csv,.xlsx,.xls,.json">
                                </div>
                                <button type="button" class="btn btn-primary" id="analyzeFileBtn" disabled>
                                    <i class="bi bi-search"></i> Analyze File
                                </button>
                            </div>

                            <!-- Step 2: Preview & Mapping -->
                            <div id="importStep2" class="import-step d-none">
                                <h6 class="mb-3">Step 2: Review Mapping & Preview</h6>
                                
                                <div id="mappingStatus" class="alert mb-3"></div>
                                
                                <!-- Mapping Table -->
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <strong>Column Mapping</strong>
                                        <small class="text-muted ms-2">(Click to adjust if needed)</small>
                                    </div>
                                    <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                                        <table class="table table-sm" id="mappingTable">
                                            <thead>
                                                <tr>
                                                    <th>Source Column</th>
                                                    <th>→ Maps To →</th>
                                                    <th>Target Field</th>
                                                    <th>Confidence</th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- Preview Data -->
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <strong>Data Preview</strong>
                                        <small class="text-muted ms-2">(First 3 rows)</small>
                                    </div>
                                    <div class="card-body" style="max-height: 250px; overflow: auto;">
                                        <div id="previewTable"></div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" id="backToStep1Btn">
                                        <i class="bi bi-arrow-left"></i> Back
                                    </button>
                                    <button type="button" class="btn btn-success" id="executeImportBtn">
                                        <i class="bi bi-check-circle"></i> Import Data
                                    </button>
                                </div>
                            </div>

                            <!-- Step 3: Results -->
                            <div id="importStep3" class="import-step d-none">
                                <h6 class="mb-3">Step 3: Import Results</h6>
                                <div id="importResults"></div>
                                <button type="button" class="btn btn-primary" onclick="window.smartImportUI.close()">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append to body if not exists
        if (!document.getElementById('smartImportModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const fileInput = document.getElementById('importFileInput');
        const analyzeBtn = document.getElementById('analyzeFileBtn');
        const backBtn = document.getElementById('backToStep1Btn');
        const executeBtn = document.getElementById('executeImportBtn');
        const dataTypeSelect = document.getElementById('importDataType');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.currentFile = e.target.files[0];
                analyzeBtn.disabled = !this.currentFile;
            });
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeFile());
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => this.showStep(1));
        }

        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeImport());
        }

        if (dataTypeSelect) {
            dataTypeSelect.addEventListener('change', (e) => {
                this.dataType = e.target.value;
            });
        }
    }

    /**
     * Show a specific step
     */
    showStep(stepNumber) {
        document.querySelectorAll('.import-step').forEach(step => {
            step.classList.add('d-none');
        });
        document.getElementById(`importStep${stepNumber}`).classList.remove('d-none');
    }

    /**
     * Open the import modal
     */
    open() {
        const modal = document.getElementById('smartImportModal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop
            if (!document.querySelector('.modal-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
            
            this.showStep(1);
        }
    }

    /**
     * Close the import modal
     */
    close() {
        const modal = document.getElementById('smartImportModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Remove backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
    }

    /**
     * Analyze the uploaded file
     */
    async analyzeFile() {
        if (!this.currentFile) return;

        const analyzeBtn = document.getElementById('analyzeFileBtn');
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Analyzing...';
        analyzeBtn.disabled = true;

        try {
            // Use client-side importer
            const result = await this.importer.analyzeFile(this.currentFile, this.dataType);

            if (result.success) {
                this.analysisResult = result;
                this.displayAnalysisResults(result);
                this.showStep(2);
            } else {
                alert('Error analyzing file: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error analyzing file: ' + error.message);
        } finally {
            analyzeBtn.innerHTML = originalText;
            analyzeBtn.disabled = false;
        }
    }

    /**
     * Display analysis results
     */
    displayAnalysisResults(result) {
        const mapping = result.mapping_suggestions;
        
        // Display status
        const statusDiv = document.getElementById('mappingStatus');
        const mappedCount = Object.keys(mapping.mapping).length;
        const totalCount = result.source_headers.length;
        const missingRequired = mapping.missing_required.length;

        let statusClass = 'alert-success';
        let statusIcon = 'bi-check-circle';
        let statusText = `Successfully mapped ${mappedCount} of ${totalCount} columns!`;

        if (missingRequired > 0) {
            statusClass = 'alert-warning';
            statusIcon = 'bi-exclamation-triangle';
            statusText = `Mapped ${mappedCount} of ${totalCount} columns. Missing ${missingRequired} required fields.`;
        }

        statusDiv.className = `alert ${statusClass}`;
        statusDiv.innerHTML = `
            <i class="bi ${statusIcon}"></i> ${statusText}
            <div class="mt-2"><strong>File:</strong> ${this.currentFile.name} | <strong>Rows:</strong> ${result.row_count}</div>
        `;

        // Display mapping table
        this.displayMappingTable(result.source_headers, mapping);

        // Display preview data
        this.displayPreviewData(result.preview_data);
    }

    /**
     * Display mapping table
     */
    displayMappingTable(sourceHeaders, mapping) {
        const tbody = document.querySelector('#mappingTable tbody');
        tbody.innerHTML = '';

        sourceHeaders.forEach(header => {
            const mappingInfo = mapping.mapping[header];
            const tr = document.createElement('tr');

            if (mappingInfo) {
                const confidence = mappingInfo.confidence;
                let confidenceClass = 'success';
                if (confidence < 80) confidenceClass = 'warning';
                if (confidence < 60) confidenceClass = 'danger';

                tr.innerHTML = `
                    <td><code>${header}</code></td>
                    <td class="text-center">→</td>
                    <td><strong>${mappingInfo.target_field}</strong> ${mappingInfo.is_required ? '<span class="badge bg-danger">Required</span>' : ''}</td>
                    <td><span class="badge bg-${confidenceClass}">${confidence}%</span></td>
                `;
            } else {
                tr.innerHTML = `
                    <td><code>${header}</code></td>
                    <td class="text-center">→</td>
                    <td class="text-muted"><em>Not mapped</em></td>
                    <td><span class="badge bg-secondary">-</span></td>
                `;
            }

            tbody.appendChild(tr);
        });
    }

    /**
     * Display preview data
     */
    displayPreviewData(previewData) {
        const previewDiv = document.getElementById('previewTable');
        
        if (!previewData || previewData.length === 0) {
            previewDiv.innerHTML = '<p class="text-muted">No preview data available</p>';
            return;
        }

        // Get all unique keys
        const keys = [...new Set(previewData.flatMap(Object.keys))];
        
        let html = '<table class="table table-sm table-striped"><thead><tr>';
        keys.forEach(key => {
            html += `<th>${key}</th>`;
        });
        html += '</tr></thead><tbody>';

        previewData.forEach(row => {
            html += '<tr>';
            keys.forEach(key => {
                html += `<td>${row[key] !== undefined && row[key] !== null ? row[key] : '-'}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        previewDiv.innerHTML = html;
    }

    /**
     * Execute the import
     */
    async executeImport() {
        const executeBtn = document.getElementById('executeImportBtn');
        const originalText = executeBtn.innerHTML;
        executeBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Importing...';
        executeBtn.disabled = true;

        try {
            // Use client-side importer
            const result = await this.importer.executeImport(this.analysisResult, this.userMappings);

            this.displayImportResults(result);
            this.showStep(3);

            // Refresh the page data if successful
            if (result.success && typeof loadData === 'function') {
                setTimeout(() => {
                    loadData();
                    if (typeof updateDashboard === 'function') {
                        updateDashboard();
                    }
                    if (typeof updateInventoryView === 'function') {
                        updateInventoryView();
                    }
                }, 500);
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        } finally {
            executeBtn.innerHTML = originalText;
            executeBtn.disabled = false;
        }
    }

    /**
     * Display import results
     */
    displayImportResults(result) {
        const resultsDiv = document.getElementById('importResults');
        
        if (result.success) {
            const validation = result.validation;
            const warningHtml = validation.warnings.length > 0 
                ? `<div class="alert alert-warning mt-3">
                     <strong>Warnings:</strong>
                     <ul>${validation.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                   </div>`
                : '';

            resultsDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="bi bi-check-circle"></i>
                    <strong>Import Successful!</strong>
                    <p class="mb-0 mt-2">Successfully imported ${validation.total_records} records.</p>
                </div>
                ${warningHtml}
            `;
        } else {
            const validation = result.validation || {};
            const errors = validation.errors || [result.error || 'Unknown error'];
            
            resultsDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle"></i>
                    <strong>Import Failed</strong>
                    <ul class="mb-0 mt-2">
                        ${errors.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.smartImportUI = new SmartImportUI();
    window.smartImportUI.init();
});

/**
 * Function to open the smart import modal
 */
function openSmartImport() {
    if (window.smartImportUI) {
        window.smartImportUI.open();
    } else {
        alert('Smart Import is loading. Please try again in a moment.');
    }
}
