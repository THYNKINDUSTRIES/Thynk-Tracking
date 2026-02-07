// ===========================
// Data Storage and Management
// ===========================

// Load data from localStorage with proper structure
let bulkIntakes = JSON.parse(localStorage.getItem('bulkIntakes')) || [];
let lots = JSON.parse(localStorage.getItem('lots')) || [];
let conversions = JSON.parse(localStorage.getItem('conversions')) || [];
let shipments = JSON.parse(localStorage.getItem('shipments')) || [];

// Wizard state
let currentIntakeStep = 1;

// Generate unique ID
function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Save all data to localStorage
function saveData() {
    localStorage.setItem('bulkIntakes', JSON.stringify(bulkIntakes));
    localStorage.setItem('lots', JSON.stringify(lots));
    localStorage.setItem('conversions', JSON.stringify(conversions));
    localStorage.setItem('shipments', JSON.stringify(shipments));
}

// ===========================
// UI Update Functions
// ===========================

function updateAllUI() {
    updateIntakeTable();
    updateLotsDisplay();
    updateConversionsTable();
    updateShipmentsTable();
    updateInventoryDisplay();
    updateInventorySummary();
    updateReportsData();
}

// Update intake table
function updateIntakeTable() {
    const tbody = document.getElementById('intakeTableBody');
    if (bulkIntakes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No bulk intakes yet. Click the button above to add your first intake!
                </td>
            </tr>`;
        return;
    }
    
    tbody.innerHTML = bulkIntakes.map(intake => {
        const status = intake.remainingAmount > 0 ? 
            '<span class="lot-badge status-active">Active</span>' : 
            '<span class="lot-badge status-depleted">Fully Used</span>';
        return `
            <tr>
                <td>${intake.date}</td>
                <td><strong>${intake.lotNumber}</strong></td>
                <td>${intake.remainingAmount.toFixed(2)} / ${intake.amount} lbs</td>
                <td>${intake.type}</td>
                <td>${intake.supplier}</td>
                <td>${status}</td>
            </tr>`;
    }).join('');
}

// Update lots display
function updateLotsDisplay() {
    const container = document.getElementById('lotsContainer');
    const allLots = [...bulkIntakes, ...lots].filter(lot => lot.remainingAmount > 0);
    
    if (allLots.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-box-seam fs-1 d-block mb-2"></i>
                No lots available. Add a bulk intake first, then subdivide it here!
            </div>`;
        return;
    }
    
    container.innerHTML = allLots.map(lot => {
        const statusClass = lot.remainingAmount > lot.amount * 0.5 ? 'status-active' : 'status-partial';
        const isParent = lot.childLots && lot.childLots.length > 0;
        return `
            <div class="lot-card">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="mb-2">
                            <i class="bi bi-${isParent ? 'box-seam' : 'diagram-3'}"></i>
                            ${lot.lotNumber}
                            ${lot.parentLot ? `<small class="text-muted">(from ${lot.parentLot})</small>` : ''}
                        </h5>
                        <p class="mb-2">
                            <strong>Remaining:</strong> ${lot.remainingAmount.toFixed(2)} lbs out of ${lot.amount} lbs<br>
                            <strong>Type:</strong> ${lot.type || 'N/A'}<br>
                            ${lot.profile ? `<strong>Profile:</strong> ${lot.profile}<br>` : ''}
                            ${lot.supplier ? `<strong>Supplier:</strong> ${lot.supplier}` : ''}
                        </p>
                    </div>
                    <div>
                        <span class="lot-badge ${statusClass}">
                            ${((lot.remainingAmount / lot.amount) * 100).toFixed(0)}% Available
                        </span>
                    </div>
                </div>
                ${isParent ? `
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="bi bi-diagram-3"></i> 
                            Subdivided into ${lot.childLots.length} child lots
                        </small>
                    </div>
                ` : ''}
            </div>`;
    }).join('');
}

// Update conversions table
function updateConversionsTable() {
    const tbody = document.getElementById('conversionsTableBody');
    if (conversions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-gear fs-1 d-block mb-2"></i>
                    No conversions yet. Click a button above to start processing!
                </td>
            </tr>`;
        return;
    }
    
    tbody.innerHTML = conversions.map(conv => `
        <tr>
            <td>${conv.date}</td>
            <td><i class="bi bi-${getProductIcon(conv.productType)}"></i> ${conv.productType}</td>
            <td>${conv.sourceLot}</td>
            <td>${conv.amountUsed} lbs</td>
            <td>${conv.unitsCreated} units</td>
            <td><strong>${conv.batchId}</strong></td>
        </tr>`
    ).join('');
}

// Update shipments table
function updateShipmentsTable() {
    const tbody = document.getElementById('shipmentsTableBody');
    if (shipments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-truck fs-1 d-block mb-2"></i>
                    No shipments yet. Click the button above to create your first shipment!
                </td>
            </tr>`;
        return;
    }
    
    tbody.innerHTML = shipments.map(ship => `
        <tr>
            <td>${ship.date}</td>
            <td><strong>${ship.batchId}</strong></td>
            <td>${ship.productType}</td>
            <td>${ship.quantity} units</td>
            <td>${ship.recipient}</td>
            <td>${ship.tracking || 'N/A'}</td>
        </tr>`
    ).join('');
}

// Update inventory display
function updateInventoryDisplay() {
    const container = document.getElementById('inventoryDetails');
    
    // Calculate inventory stats
    const activeBulkLots = bulkIntakes.filter(lot => lot.remainingAmount > 0);
    const activeSubLots = lots.filter(lot => lot.remainingAmount > 0);
    const activeProducts = conversions.filter(conv => conv.remainingUnits > 0);
    
    if (activeBulkLots.length === 0 && activeSubLots.length === 0 && activeProducts.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                No inventory to display. Start by adding a bulk intake!
            </div>`;
        return;
    }
    
    let html = '';
    
    if (activeBulkLots.length > 0) {
        html += '<h5 class="mb-3"><i class="bi bi-box-seam"></i> Bulk Lots</h5>';
        html += activeBulkLots.map(lot => `
            <div class="lot-card">
                <strong>${lot.lotNumber}</strong> - ${lot.type}<br>
                Available: ${lot.remainingAmount.toFixed(2)} / ${lot.amount} lbs<br>
                <small class="text-muted">Received: ${lot.date} from ${lot.supplier}</small>
            </div>`
        ).join('');
    }
    
    if (activeSubLots.length > 0) {
        html += '<h5 class="mb-3 mt-4"><i class="bi bi-diagram-3"></i> Sub Lots</h5>';
        html += activeSubLots.map(lot => `
            <div class="lot-card">
                <strong>${lot.lotNumber}</strong> (from ${lot.parentLot})<br>
                Available: ${lot.remainingAmount.toFixed(2)} / ${lot.amount} lbs<br>
                <small class="text-muted">${lot.type || 'N/A'}</small>
            </div>`
        ).join('');
    }
    
    if (activeProducts.length > 0) {
        html += '<h5 class="mb-3 mt-4"><i class="bi bi-gear"></i> Finished Products</h5>';
        html += activeProducts.map(conv => `
            <div class="lot-card">
                <strong>${conv.batchId}</strong> - ${conv.productType}<br>
                Available: ${conv.remainingUnits} / ${conv.unitsCreated} units<br>
                <small class="text-muted">Processed: ${conv.date} from ${conv.sourceLot}</small>
            </div>`
        ).join('');
    }
    
    container.innerHTML = html;
}

// Update inventory summary at top
function updateInventorySummary() {
    const bulkCount = bulkIntakes.filter(lot => lot.remainingAmount > 0).length;
    const subCount = lots.filter(lot => lot.remainingAmount > 0).length;
    const productCount = conversions.filter(conv => conv.remainingUnits > 0).length;
    const totalWeight = [...bulkIntakes, ...lots]
        .filter(lot => lot.remainingAmount > 0)
        .reduce((sum, lot) => sum + lot.remainingAmount, 0);
    
    document.getElementById('invBulkLots').textContent = bulkCount;
    document.getElementById('invSubLots').textContent = subCount;
    document.getElementById('invProducts').textContent = productCount;
    document.getElementById('invTotalWeight').textContent = totalWeight.toFixed(2) + ' lbs';
    document.getElementById('totalInventory').textContent = totalWeight.toFixed(2) + ' lbs';
}

// Update reports data
function updateReportsData() {
    const summary = {
        totalBulkIntakes: bulkIntakes.length,
        activeBulkLots: bulkIntakes.filter(lot => lot.remainingAmount > 0).length,
        totalSubdivisions: lots.length,
        activeSubLots: lots.filter(lot => lot.remainingAmount > 0).length,
        totalConversions: conversions.length,
        activeProducts: conversions.filter(conv => conv.remainingUnits > 0).length,
        totalShipments: shipments.length,
        totalWeightReceived: bulkIntakes.reduce((sum, lot) => sum + lot.amount, 0).toFixed(2) + ' lbs',
        currentInventory: [...bulkIntakes, ...lots]
            .filter(lot => lot.remainingAmount > 0)
            .reduce((sum, lot) => sum + lot.remainingAmount, 0).toFixed(2) + ' lbs'
    };
    
    document.getElementById('dataSummary').textContent = JSON.stringify(summary, null, 2);
}

// Helper function to get product icon
function getProductIcon(productType) {
    const icons = {
        'vape': 'moisture',
        'gummy': 'star',
        'preroll': 'pen',
        'flower': 'flower1',
        'beverage': 'cup-straw'
    };
    return icons[productType] || 'box';
}

// ===========================
// Intake Wizard Functions
// ===========================

function openIntakeWizard() {
    currentIntakeStep = 1;
    document.getElementById('intakeDate').value = new Date().toISOString().split('T')[0];
    showIntakeStep(1);
    new bootstrap.Modal(document.getElementById('intakeWizardModal')).show();
}

function showIntakeStep(step) {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`intakeStep${i}`).classList.remove('active');
        document.getElementById(`intakeStep${i}Indicator`).classList.remove('active', 'completed');
    }
    
    // Show current step
    document.getElementById(`intakeStep${step}`).classList.add('active');
    document.getElementById(`intakeStep${step}Indicator`).classList.add('active');
    
    // Mark completed steps
    for (let i = 1; i < step; i++) {
        document.getElementById(`intakeStep${i}Indicator`).classList.add('completed');
    }
    
    // Update buttons
    document.getElementById('intakePrevBtn').style.display = step > 1 ? 'inline-block' : 'none';
    document.getElementById('intakeNextBtn').style.display = step < 3 ? 'inline-block' : 'none';
    document.getElementById('intakeSubmitBtn').style.display = step === 3 ? 'inline-block' : 'none';
    
    // If step 3, show confirmation
    if (step === 3) {
        const details = `
            <p><strong>Date Received:</strong> ${document.getElementById('intakeDate').value}</p>
            <p><strong>Lot Number:</strong> ${document.getElementById('intakeLotNumber').value}</p>
            <p><strong>Supplier:</strong> ${document.getElementById('intakeSupplier').value}</p>
            <p><strong>Amount:</strong> ${document.getElementById('intakeAmount').value} lbs</p>
            <p><strong>Type:</strong> ${document.getElementById('intakeType').value}</p>
            <p><strong>Cannabinoid Profile:</strong> ${document.getElementById('intakeProfile').value || 'N/A'}</p>
            <p><strong>Notes:</strong> ${document.getElementById('intakeNotes').value || 'N/A'}</p>
        `;
        document.getElementById('intakeConfirmDetails').innerHTML = details;
    }
}

function nextIntakeStep() {
    if (currentIntakeStep === 1) {
        // Validate step 1
        if (!document.getElementById('intakeDate').value || 
            !document.getElementById('intakeLotNumber').value || 
            !document.getElementById('intakeSupplier').value) {
            alert('Please fill in all required fields');
            return;
        }
    } else if (currentIntakeStep === 2) {
        // Validate step 2
        if (!document.getElementById('intakeAmount').value || 
            !document.getElementById('intakeType').value) {
            alert('Please fill in all required fields');
            return;
        }
    }
    
    currentIntakeStep++;
    showIntakeStep(currentIntakeStep);
}

function previousIntakeStep() {
    currentIntakeStep--;
    showIntakeStep(currentIntakeStep);
}

function submitIntake() {
    const intake = {
        id: generateId('INTAKE'),
        date: document.getElementById('intakeDate').value,
        lotNumber: document.getElementById('intakeLotNumber').value,
        supplier: document.getElementById('intakeSupplier').value,
        amount: parseFloat(document.getElementById('intakeAmount').value),
        remainingAmount: parseFloat(document.getElementById('intakeAmount').value),
        type: document.getElementById('intakeType').value,
        profile: document.getElementById('intakeProfile').value,
        notes: document.getElementById('intakeNotes').value,
        childLots: [],
        chainOfCustody: [{
            action: 'Intake',
            date: document.getElementById('intakeDate').value,
            notes: `Received from ${document.getElementById('intakeSupplier').value}`
        }]
    };
    
    bulkIntakes.push(intake);
    saveData();
    updateAllUI();
    
    bootstrap.Modal.getInstance(document.getElementById('intakeWizardModal')).hide();
    
    // Clear form
    document.getElementById('intakeLotNumber').value = '';
    document.getElementById('intakeSupplier').value = '';
    document.getElementById('intakeAmount').value = '';
    document.getElementById('intakeType').value = '';
    document.getElementById('intakeProfile').value = '';
    document.getElementById('intakeNotes').value = '';
    
    alert('Bulk intake added successfully!');
}

// ===========================
// Subdivide Functions
// ===========================

function openSubdivideWizard() {
    const select = document.getElementById('subdivideParentLot');
    const availableLots = [...bulkIntakes, ...lots].filter(lot => lot.remainingAmount > 0);
    
    if (availableLots.length === 0) {
        alert('No lots available to subdivide. Please add a bulk intake first.');
        return;
    }
    
    select.innerHTML = '<option value="">Choose a lot...</option>' + 
        availableLots.map(lot => 
            `<option value="${lot.lotNumber}">${lot.lotNumber} (${lot.remainingAmount.toFixed(2)} lbs available)</option>`
        ).join('');
    
    document.getElementById('subdivideCount').value = 2;
    generateSubdivideFields();
    new bootstrap.Modal(document.getElementById('subdivideWizardModal')).show();
}

function updateSubdivideInfo() {
    const lotNumber = document.getElementById('subdivideParentLot').value;
    const infoDiv = document.getElementById('subdivideParentInfo');
    
    if (!lotNumber) {
        infoDiv.innerHTML = '';
        return;
    }
    
    const lot = [...bulkIntakes, ...lots].find(l => l.lotNumber === lotNumber);
    if (lot) {
        infoDiv.innerHTML = `
            <div class="alert alert-info mt-2">
                <strong>Available:</strong> ${lot.remainingAmount.toFixed(2)} lbs<br>
                <strong>Type:</strong> ${lot.type}
            </div>`;
    }
}

function generateSubdivideFields() {
    const count = parseInt(document.getElementById('subdivideCount').value) || 2;
    const container = document.getElementById('subdivideChildFields');
    
    let html = '<h5 class="mt-4 mb-3">Child Lot Details</h5>';
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="card p-3 mb-3 bg-light">
                <h6>Child Lot ${i}</h6>
                <div class="mb-2">
                    <label class="form-label">Lot Number</label>
                    <input type="text" class="form-control" id="childLot${i}Number" placeholder="e.g., SUB-${i}" required>
                </div>
                <div class="mb-2">
                    <label class="form-label">Amount (lbs)</label>
                    <input type="number" class="form-control" id="childLot${i}Amount" step="0.01" min="0" required>
                </div>
            </div>`;
    }
    container.innerHTML = html;
}

function submitSubdivide() {
    const parentLotNumber = document.getElementById('subdivideParentLot').value;
    const count = parseInt(document.getElementById('subdivideCount').value);
    
    if (!parentLotNumber) {
        alert('Please select a parent lot');
        return;
    }
    
    const parentLot = [...bulkIntakes, ...lots].find(l => l.lotNumber === parentLotNumber);
    if (!parentLot) {
        alert('Parent lot not found');
        return;
    }
    
    // Collect child lot data
    const childLots = [];
    let totalAmount = 0;
    
    for (let i = 1; i <= count; i++) {
        const lotNumber = document.getElementById(`childLot${i}Number`).value;
        const amount = parseFloat(document.getElementById(`childLot${i}Amount`).value);
        
        if (!lotNumber || !amount) {
            alert(`Please fill in all fields for Child Lot ${i}`);
            return;
        }
        
        childLots.push({ lotNumber, amount });
        totalAmount += amount;
    }
    
    // Validate total amount
    if (totalAmount > parentLot.remainingAmount) {
        alert(`Total amount (${totalAmount} lbs) exceeds available amount (${parentLot.remainingAmount} lbs)`);
        return;
    }
    
    // Create child lots
    childLots.forEach(child => {
        const newLot = {
            id: generateId('SUBLOT'),
            lotNumber: child.lotNumber,
            parentLot: parentLot.lotNumber,
            amount: child.amount,
            remainingAmount: child.amount,
            type: parentLot.type,
            profile: parentLot.profile,
            date: new Date().toISOString().split('T')[0],
            chainOfCustody: [
                ...parentLot.chainOfCustody,
                {
                    action: 'Subdivide',
                    date: new Date().toISOString().split('T')[0],
                    notes: `Subdivided from ${parentLot.lotNumber}`
                }
            ]
        };
        lots.push(newLot);
    });
    
    // Update parent lot
    parentLot.remainingAmount -= totalAmount;
    if (!parentLot.childLots) parentLot.childLots = [];
    parentLot.childLots.push(...childLots.map(c => c.lotNumber));
    
    // Add to chain of custody
    parentLot.chainOfCustody.push({
        action: 'Subdivide',
        date: new Date().toISOString().split('T')[0],
        notes: `Subdivided into ${count} child lots (${totalAmount} lbs total)`
    });
    
    saveData();
    updateAllUI();
    
    bootstrap.Modal.getInstance(document.getElementById('subdivideWizardModal')).hide();
    alert('Lot subdivided successfully!');
}

// ===========================
// Process Functions
// ===========================

function openProcessWizard(productType) {
    const select = document.getElementById('processSourceLot');
    const availableLots = [...bulkIntakes, ...lots].filter(lot => lot.remainingAmount > 0);
    
    if (availableLots.length === 0) {
        alert('No lots available to process. Please add a bulk intake first.');
        return;
    }
    
    document.getElementById('processProductType').value = productType;
    
    const productNames = {
        'vape': 'Vapes',
        'gummy': 'Gummies',
        'preroll': 'Prerolls',
        'flower': 'Bagged Flower',
        'beverage': 'Beverages'
    };
    document.getElementById('processModalTitle').innerHTML = 
        `<i class="bi bi-gear"></i> Process Into ${productNames[productType]}`;
    
    select.innerHTML = '<option value="">Choose a lot...</option>' + 
        availableLots.map(lot => 
            `<option value="${lot.lotNumber}">${lot.lotNumber} (${lot.remainingAmount.toFixed(2)} lbs available)</option>`
        ).join('');
    
    document.getElementById('processDate').value = new Date().toISOString().split('T')[0];
    
    new bootstrap.Modal(document.getElementById('processWizardModal')).show();
}

function updateProcessInfo() {
    const lotNumber = document.getElementById('processSourceLot').value;
    const infoDiv = document.getElementById('processSourceInfo');
    
    if (!lotNumber) {
        infoDiv.innerHTML = '';
        return;
    }
    
    const lot = [...bulkIntakes, ...lots].find(l => l.lotNumber === lotNumber);
    if (lot) {
        infoDiv.innerHTML = `
            <div class="alert alert-info mt-2">
                <strong>Available:</strong> ${lot.remainingAmount.toFixed(2)} lbs<br>
                <strong>Type:</strong> ${lot.type}
            </div>`;
    }
}

function submitProcess() {
    const sourceLotNumber = document.getElementById('processSourceLot').value;
    const amount = parseFloat(document.getElementById('processAmount').value);
    const units = parseInt(document.getElementById('processUnits').value);
    const batchId = document.getElementById('processBatchId').value;
    const productType = document.getElementById('processProductType').value;
    const date = document.getElementById('processDate').value;
    const notes = document.getElementById('processNotes').value;
    
    if (!sourceLotNumber || !amount || !units || !batchId || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const sourceLot = [...bulkIntakes, ...lots].find(l => l.lotNumber === sourceLotNumber);
    if (!sourceLot) {
        alert('Source lot not found');
        return;
    }
    
    if (amount > sourceLot.remainingAmount) {
        alert(`Amount exceeds available amount (${sourceLot.remainingAmount.toFixed(2)} lbs)`);
        return;
    }
    
    // Create conversion record
    const conversion = {
        id: generateId('CONV'),
        date,
        productType,
        sourceLot: sourceLotNumber,
        amountUsed: amount,
        unitsCreated: units,
        remainingUnits: units,
        batchId,
        notes,
        chainOfCustody: [
            ...sourceLot.chainOfCustody,
            {
                action: 'Process',
                date,
                notes: `Processed ${amount} lbs into ${units} ${productType} units`
            }
        ]
    };
    
    conversions.push(conversion);
    
    // Update source lot
    sourceLot.remainingAmount -= amount;
    sourceLot.chainOfCustody.push({
        action: 'Process',
        date,
        notes: `${amount} lbs used to create ${batchId} (${productType})`
    });
    
    saveData();
    updateAllUI();
    
    bootstrap.Modal.getInstance(document.getElementById('processWizardModal')).hide();
    
    // Clear form
    document.getElementById('processAmount').value = '';
    document.getElementById('processUnits').value = '';
    document.getElementById('processBatchId').value = '';
    document.getElementById('processNotes').value = '';
    
    alert('Product processed successfully!');
}

// ===========================
// Ship Functions
// ===========================

function openShipWizard() {
    const select = document.getElementById('shipBatchId');
    const availableProducts = conversions.filter(conv => conv.remainingUnits > 0);
    
    if (availableProducts.length === 0) {
        alert('No products available to ship. Please process some products first.');
        return;
    }
    
    select.innerHTML = '<option value="">Choose a batch...</option>' + 
        availableProducts.map(conv => 
            `<option value="${conv.batchId}">${conv.batchId} - ${conv.productType} (${conv.remainingUnits} units available)</option>`
        ).join('');
    
    document.getElementById('shipDate').value = new Date().toISOString().split('T')[0];
    
    new bootstrap.Modal(document.getElementById('shipWizardModal')).show();
}

function updateShipInfo() {
    const batchId = document.getElementById('shipBatchId').value;
    const infoDiv = document.getElementById('shipBatchInfo');
    
    if (!batchId) {
        infoDiv.innerHTML = '';
        return;
    }
    
    const product = conversions.find(c => c.batchId === batchId);
    if (product) {
        infoDiv.innerHTML = `
            <div class="alert alert-info mt-2">
                <strong>Product:</strong> ${product.productType}<br>
                <strong>Available Units:</strong> ${product.remainingUnits}
            </div>`;
    }
}

function submitShipment() {
    const batchId = document.getElementById('shipBatchId').value;
    const quantity = parseInt(document.getElementById('shipQuantity').value);
    const recipient = document.getElementById('shipRecipient').value;
    const address = document.getElementById('shipAddress').value;
    const tracking = document.getElementById('shipTracking').value;
    const date = document.getElementById('shipDate').value;
    
    if (!batchId || !quantity || !recipient || !address || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const product = conversions.find(c => c.batchId === batchId);
    if (!product) {
        alert('Product batch not found');
        return;
    }
    
    if (quantity > product.remainingUnits) {
        alert(`Quantity exceeds available units (${product.remainingUnits})`);
        return;
    }
    
    // Create shipment record
    const shipment = {
        id: generateId('SHIP'),
        date,
        batchId,
        productType: product.productType,
        quantity,
        recipient,
        address,
        tracking,
        chainOfCustody: [
            ...product.chainOfCustody,
            {
                action: 'Ship',
                date,
                notes: `Shipped ${quantity} units to ${recipient}`
            }
        ]
    };
    
    shipments.push(shipment);
    
    // Update product
    product.remainingUnits -= quantity;
    product.chainOfCustody.push({
        action: 'Ship',
        date,
        notes: `Shipped ${quantity} units to ${recipient}`
    });
    
    saveData();
    updateAllUI();
    
    bootstrap.Modal.getInstance(document.getElementById('shipWizardModal')).hide();
    
    // Clear form
    document.getElementById('shipQuantity').value = '';
    document.getElementById('shipRecipient').value = '';
    document.getElementById('shipAddress').value = '';
    document.getElementById('shipTracking').value = '';
    
    alert('Shipment created successfully!');
}

// ===========================
// Export/Import Functions
// ===========================

function exportAllData() {
    const data = {
        exportDate: new Date().toISOString(),
        bulkIntakes,
        lots,
        conversions,
        shipments
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hemp-traceability-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully!');
}

function exportChainOfCustody() {
    const report = {
        reportDate: new Date().toISOString(),
        reportType: 'Chain of Custody',
        bulkIntakes: bulkIntakes.map(intake => ({
            lotNumber: intake.lotNumber,
            chainOfCustody: intake.chainOfCustody
        })),
        lots: lots.map(lot => ({
            lotNumber: lot.lotNumber,
            parentLot: lot.parentLot,
            chainOfCustody: lot.chainOfCustody
        })),
        conversions: conversions.map(conv => ({
            batchId: conv.batchId,
            productType: conv.productType,
            chainOfCustody: conv.chainOfCustody
        })),
        shipments: shipments.map(ship => ({
            batchId: ship.batchId,
            recipient: ship.recipient,
            chainOfCustody: ship.chainOfCustody
        }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chain-of-custody-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Chain of custody report exported successfully!');
}

function exportInventoryReport() {
    const report = {
        reportDate: new Date().toISOString(),
        reportType: 'Inventory',
        bulkLots: bulkIntakes.filter(lot => lot.remainingAmount > 0).map(lot => ({
            lotNumber: lot.lotNumber,
            type: lot.type,
            remainingAmount: lot.remainingAmount,
            totalAmount: lot.amount
        })),
        subLots: lots.filter(lot => lot.remainingAmount > 0).map(lot => ({
            lotNumber: lot.lotNumber,
            parentLot: lot.parentLot,
            type: lot.type,
            remainingAmount: lot.remainingAmount,
            totalAmount: lot.amount
        })),
        products: conversions.filter(conv => conv.remainingUnits > 0).map(conv => ({
            batchId: conv.batchId,
            productType: conv.productType,
            remainingUnits: conv.remainingUnits,
            totalUnits: conv.unitsCreated
        }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Inventory report exported successfully!');
}

function importData() {
    document.getElementById('importFileInput').click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Are you sure?')) {
                bulkIntakes = data.bulkIntakes || [];
                lots = data.lots || [];
                conversions = data.conversions || [];
                shipments = data.shipments || [];
                
                saveData();
                updateAllUI();
                
                alert('Data imported successfully!');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

// ===========================
// Initialize on Load
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    updateAllUI();
});