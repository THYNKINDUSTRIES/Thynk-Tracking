// ========================================
// Hemp Traceability System - Main App Logic
// ========================================

// Data structures
let lots = JSON.parse(localStorage.getItem('lots')) || [];
let processes = JSON.parse(localStorage.getItem('processes')) || [];
let shipments = JSON.parse(localStorage.getItem('shipments')) || [];
let chainOfCustody = JSON.parse(localStorage.getItem('chainOfCustody')) || [];
let testingRecords = JSON.parse(localStorage.getItem('testingRecords')) || [];

// Current state
let selectedCategory = '';
let currentInventoryFilter = 'all';

// ========================================
// Navigation Functions
// ========================================

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.nav-section').forEach(section => {
        section.classList.add('section-hidden');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.remove('section-hidden');
    
    // Update data for the section
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'bulkIntake') {
        updateIntakeTable();
    } else if (sectionId === 'subdivideLots') {
        updateSubdivideLots();
    } else if (sectionId === 'processConvert') {
        updateProcessSection();
    } else if (sectionId === 'outputShip') {
        updateShipmentSection();
    } else if (sectionId === 'testing') {
        updateTestingSection();
    } else if (sectionId === 'inventory') {
        updateInventoryView();
    } else if (sectionId === 'reports') {
        updateReportsSection();
    }
}

// ========================================
// Dashboard Functions
// ========================================

function updateDashboard() {
    const activeLots = lots.filter(lot => lot.status === 'active').length;
    const todayProcesses = processes.filter(p => {
        const processDate = new Date(p.date);
        const today = new Date();
        return processDate.toDateString() === today.toDateString();
    }).length;
    
    document.getElementById('statsActiveLots').textContent = activeLots;
    document.getElementById('statsProcesses').textContent = todayProcesses;
    document.getElementById('statsShipments').textContent = shipments.length;
    document.getElementById('statsTotalItems').textContent = lots.length;
}

// ========================================
// Bulk Intake Functions
// ========================================

function selectCategory(category) {
    selectedCategory = category;
    document.getElementById('intakeCategory').value = category;
    document.getElementById('intakeFormSection').style.display = 'block';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('intakeDate').value = today;
}

// Handle intake form submission
document.addEventListener('DOMContentLoaded', function() {
    const intakeForm = document.getElementById('intakeForm');
    if (intakeForm) {
        intakeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const lot = {
                id: document.getElementById('intakeLotId').value,
                category: document.getElementById('intakeCategory').value,
                quantity: parseFloat(document.getElementById('intakeQuantity').value),
                originalQuantity: parseFloat(document.getElementById('intakeQuantity').value),
                unit: document.getElementById('intakeUnit').value,
                date: document.getElementById('intakeDate').value,
                vendor: document.getElementById('intakeVendor').value,
                productType: document.getElementById('intakeProductType').value,
                cannabinoidProfile: document.getElementById('intakeCannabinoidProfile').value,
                notes: document.getElementById('intakeNotes').value,
                // Master Ledger CSV fields
                invoiceNum: document.getElementById('intakeInvoiceNum').value,
                invoiceDate: document.getElementById('intakeInvoiceDate').value,
                customerName: document.getElementById('intakeCustomerName').value,
                mondayItemId: document.getElementById('intakeMondayItemId').value,
                mondayLink: document.getElementById('intakeMondayLink').value,
                productSKU: document.getElementById('intakeProductSKU').value,
                lotIdentifier: document.getElementById('intakeLotIdentifier').value,
                coaLink: document.getElementById('intakeCOALink').value,
                coaMatchVerified: document.getElementById('intakeCOAMatchVerified').value,
                status: 'active',
                type: 'intake',
                timestamp: new Date().toISOString()
            };
            
            // Check if lot ID already exists
            if (lots.find(l => l.id === lot.id)) {
                alert('Error: Lot ID already exists. Please use a unique ID.');
                return;
            }
            
            lots.push(lot);
            
            // Add to chain of custody
            addToChainOfCustody(lot.id, 'intake', `Received from ${lot.vendor}`, lot);
            
            saveData();
            updateIntakeTable();
            
            alert('✓ Intake recorded successfully!');
            intakeForm.reset();
            document.getElementById('intakeFormSection').style.display = 'none';
        });
    }
});

function updateIntakeTable() {
    const tbody = document.getElementById('intakeTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const intakeLots = lots.filter(lot => lot.type === 'intake');
    
    intakeLots.reverse().slice(0, 20).forEach(lot => {
        const statusBadge = lot.status === 'active' ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-secondary">Depleted</span>';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${lot.id}</strong></td>
                <td><span class="category-badge bg-primary text-white">${lot.category}</span></td>
                <td>${lot.quantity} ${lot.unit}</td>
                <td>${lot.date}</td>
                <td>${lot.vendor}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
}

// ========================================
// Subdivide Lots Functions
// ========================================

function updateSubdivideLots() {
    const select = document.getElementById('subdivideParentLot');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select a lot to subdivide --</option>';
    
    const activeLots = lots.filter(lot => lot.status === 'active' && lot.quantity > 0);
    activeLots.forEach(lot => {
        select.innerHTML += `<option value="${lot.id}">${lot.id} - ${lot.category} (${lot.quantity} ${lot.unit})</option>`;
    });
    
    updateSubdivideTable();
}

function showSubdivideForm() {
    const parentLotId = document.getElementById('subdivideParentLot').value;
    if (!parentLotId) {
        document.getElementById('parentLotInfo').style.display = 'none';
        document.getElementById('subdivideFormSection').style.display = 'none';
        return;
    }
    
    const parentLot = lots.find(lot => lot.id === parentLotId);
    if (!parentLot) return;
    
    // Show parent lot info
    const infoDiv = document.getElementById('parentLotInfo');
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div class="alert alert-info">
            <strong>Parent Lot:</strong> ${parentLot.id}<br>
            <strong>Category:</strong> ${parentLot.category}<br>
            <strong>Available:</strong> ${parentLot.quantity} ${parentLot.unit}
        </div>
    `;
    
    // Show form
    document.getElementById('subdivideFormSection').style.display = 'block';
    
    // Update unit in child forms
    document.querySelectorAll('.child-lot-unit').forEach(input => {
        input.value = parentLot.unit;
    });
    
    document.getElementById('remainingUnit').textContent = parentLot.unit;
    updateRemainingQuantity();
}

function addChildLot() {
    const container = document.getElementById('childLotsContainer');
    const count = container.querySelectorAll('.child-lot-form').length + 1;
    
    const parentLotId = document.getElementById('subdivideParentLot').value;
    const parentLot = lots.find(lot => lot.id === parentLotId);
    
    const div = document.createElement('div');
    div.className = 'child-lot-form mb-3 p-3 border rounded';
    div.innerHTML = `
        <h6>Child Lot #${count}</h6>
        <div class="row g-3">
            <div class="col-md-4">
                <label class="form-label">Child Lot ID</label>
                <input type="text" class="form-control child-lot-id" required>
            </div>
            <div class="col-md-3">
                <label class="form-label">Quantity</label>
                <input type="number" step="0.01" class="form-control child-lot-quantity" required onchange="updateRemainingQuantity()">
            </div>
            <div class="col-md-3">
                <label class="form-label">Unit</label>
                <input type="text" class="form-control child-lot-unit" value="${parentLot.unit}" readonly>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="button" class="btn btn-danger" onclick="removeChildLot(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(div);
}

function removeChildLot(button) {
    button.closest('.child-lot-form').remove();
    updateRemainingQuantity();
}

function updateRemainingQuantity() {
    const parentLotId = document.getElementById('subdivideParentLot').value;
    const parentLot = lots.find(lot => lot.id === parentLotId);
    
    if (!parentLot) return;
    
    let totalAllocated = 0;
    document.querySelectorAll('.child-lot-quantity').forEach(input => {
        totalAllocated += parseFloat(input.value) || 0;
    });
    
    const remaining = parentLot.quantity - totalAllocated;
    document.getElementById('remainingQuantity').textContent = remaining.toFixed(2);
    
    if (remaining < 0) {
        document.getElementById('remainingQuantity').parentElement.classList.add('alert-danger');
        document.getElementById('remainingQuantity').parentElement.classList.remove('alert-info');
    } else {
        document.getElementById('remainingQuantity').parentElement.classList.remove('alert-danger');
        document.getElementById('remainingQuantity').parentElement.classList.add('alert-info');
    }
}

function submitSubdivide() {
    const parentLotId = document.getElementById('subdivideParentLot').value;
    const parentLot = lots.find(lot => lot.id === parentLotId);
    
    if (!parentLot) {
        alert('Please select a parent lot');
        return;
    }
    
    // Collect child lots
    const childLots = [];
    const childForms = document.querySelectorAll('.child-lot-form');
    
    let totalQuantity = 0;
    let hasError = false;
    
    childForms.forEach(form => {
        const id = form.querySelector('.child-lot-id').value;
        const quantity = parseFloat(form.querySelector('.child-lot-quantity').value);
        
        if (!id || !quantity) {
            hasError = true;
            return;
        }
        
        // Check for duplicate IDs
        if (lots.find(l => l.id === id)) {
            alert(`Error: Lot ID "${id}" already exists`);
            hasError = true;
            return;
        }
        
        totalQuantity += quantity;
        childLots.push({ id, quantity });
    });
    
    if (hasError) return;
    
    if (totalQuantity > parentLot.quantity) {
        alert('Error: Total child lot quantities exceed parent lot quantity');
        return;
    }
    
    // Create child lots
    childLots.forEach(child => {
        const childLot = {
            id: child.id,
            category: parentLot.category,
            quantity: child.quantity,
            originalQuantity: child.quantity,
            unit: parentLot.unit,
            date: new Date().toISOString().split('T')[0],
            vendor: parentLot.vendor,
            productType: parentLot.productType,
            cannabinoidProfile: parentLot.cannabinoidProfile,
            notes: `Subdivided from ${parentLotId}`,
            status: 'active',
            type: 'subdivided',
            parentLot: parentLotId,
            timestamp: new Date().toISOString()
        };
        
        lots.push(childLot);
        addToChainOfCustody(childLot.id, 'subdivided', `Created from parent lot ${parentLotId}`, childLot);
    });
    
    // Update parent lot
    parentLot.quantity -= totalQuantity;
    if (parentLot.quantity <= 0) {
        parentLot.status = 'depleted';
    }
    
    addToChainOfCustody(parentLotId, 'subdivided', `Subdivided into ${childLots.length} child lots (${totalQuantity} ${parentLot.unit})`, {
        childLots: childLots.map(c => c.id)
    });
    
    // Record process
    processes.push({
        type: 'subdivide',
        parentLot: parentLotId,
        childLots: childLots.map(c => c.id),
        date: new Date().toISOString().split('T')[0],
        totalQuantity,
        timestamp: new Date().toISOString()
    });
    
    saveData();
    
    alert('✓ Subdivision completed successfully!');
    
    // Reset form
    document.getElementById('subdivideParentLot').value = '';
    document.getElementById('subdivideFormSection').style.display = 'none';
    document.getElementById('parentLotInfo').style.display = 'none';
    
    updateSubdivideLots();
}

function updateSubdivideTable() {
    const tbody = document.getElementById('subdivideTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const subdivideProcesses = processes.filter(p => p.type === 'subdivide');
    subdivideProcesses.reverse().slice(0, 20).forEach(proc => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${proc.parentLot}</strong></td>
                <td>${proc.childLots.join(', ')}</td>
                <td>${proc.date}</td>
                <td>${proc.totalQuantity}</td>
            </tr>
        `;
    });
}

// ========================================
// Process/Convert Functions
// ========================================

function updateProcessSection() {
    updateProcessTable();
    populateProcessDropdowns();
}

function populateProcessDropdowns() {
    const activeLots = lots.filter(lot => lot.status === 'active' && lot.quantity > 0);
    
    // Populate snowcapping dropdowns
    const flowerSelect = document.getElementById('snowcapFlowerLot');
    const isolateSelect = document.getElementById('snowcapIsolateLot');
    
    if (flowerSelect) {
        flowerSelect.innerHTML = '<option value="">-- Select flower lot --</option>';
        activeLots.filter(lot => lot.category === 'Plant Material').forEach(lot => {
            flowerSelect.innerHTML += `<option value="${lot.id}">${lot.id} (${lot.quantity} ${lot.unit})</option>`;
        });
    }
    
    if (isolateSelect) {
        isolateSelect.innerHTML = '<option value="">-- Select isolate lot --</option>';
        activeLots.filter(lot => lot.category === 'Concentrates').forEach(lot => {
            isolateSelect.innerHTML += `<option value="${lot.id}">${lot.id} (${lot.quantity} ${lot.unit})</option>`;
        });
    }
    
    // Populate blending dropdowns
    const blendSources = document.querySelectorAll('.blend-source-lot');
    blendSources.forEach(select => {
        select.innerHTML = '<option value="">-- Select extract lot --</option>';
        activeLots.filter(lot => lot.category === 'Concentrates').forEach(lot => {
            select.innerHTML += `<option value="${lot.id}">${lot.id} (${lot.quantity} ${lot.unit})</option>`;
        });
    });
    
    // Populate conversion dropdown
    const conversionSelect = document.getElementById('conversionSourceLot');
    if (conversionSelect) {
        conversionSelect.innerHTML = '<option value="">-- Select source lot --</option>';
        activeLots.forEach(lot => {
            conversionSelect.innerHTML += `<option value="${lot.id}">${lot.id} - ${lot.category} (${lot.quantity} ${lot.unit})</option>`;
        });
    }
}

function selectProcess(processType) {
    // Hide all process forms
    document.getElementById('snowcappingForm').style.display = 'none';
    document.getElementById('blendingForm').style.display = 'none';
    document.getElementById('conversionForm').style.display = 'none';
    
    // Show selected form
    if (processType === 'snowcapping') {
        document.getElementById('snowcappingForm').style.display = 'block';
        document.getElementById('snowcapDate').value = new Date().toISOString().split('T')[0];
    } else if (processType === 'blending') {
        document.getElementById('blendingForm').style.display = 'block';
        document.getElementById('blendDate').value = new Date().toISOString().split('T')[0];
    } else if (processType === 'conversion') {
        document.getElementById('conversionForm').style.display = 'block';
        document.getElementById('conversionDate').value = new Date().toISOString().split('T')[0];
    }
    
    populateProcessDropdowns();
}

// Snowcapping form submission
document.addEventListener('DOMContentLoaded', function() {
    const snowcappingForm = document.getElementById('snowcappingFormElement');
    if (snowcappingForm) {
        snowcappingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const flowerLotId = document.getElementById('snowcapFlowerLot').value;
            const flowerQty = parseFloat(document.getElementById('snowcapFlowerQty').value);
            const isolateLotId = document.getElementById('snowcapIsolateLot').value;
            const isolateQty = parseFloat(document.getElementById('snowcapIsolateQty').value);
            const outputLotId = document.getElementById('snowcapOutputLot').value;
            
            const flowerLot = lots.find(lot => lot.id === flowerLotId);
            const isolateLot = lots.find(lot => lot.id === isolateLotId);
            
            // Validation
            if (!flowerLot || !isolateLot) {
                alert('Please select valid lots');
                return;
            }
            
            if (flowerQty > flowerLot.quantity) {
                alert('Insufficient flower quantity');
                return;
            }
            
            if (isolateQty > isolateLot.quantity) {
                alert('Insufficient isolate quantity');
                return;
            }
            
            if (lots.find(l => l.id === outputLotId)) {
                alert('Output lot ID already exists');
                return;
            }
            
            // Update source lots
            flowerLot.quantity -= flowerQty;
            if (flowerLot.quantity <= 0) flowerLot.status = 'depleted';
            
            isolateLot.quantity -= isolateQty;
            if (isolateLot.quantity <= 0) isolateLot.status = 'depleted';
            
            // Create output lot
            const outputLot = {
                id: outputLotId,
                category: 'Plant Material',
                quantity: flowerQty + isolateQty,
                originalQuantity: flowerQty + isolateQty,
                unit: flowerLot.unit,
                date: document.getElementById('snowcapDate').value,
                vendor: 'Internal Processing',
                productType: 'Snowcapped Flower',
                cannabinoidProfile: `Enhanced with THCa isolate`,
                notes: document.getElementById('snowcapNotes').value,
                status: 'active',
                type: 'processed',
                processType: 'snowcapping',
                inputs: [
                    { lotId: flowerLotId, quantity: flowerQty },
                    { lotId: isolateLotId, quantity: isolateQty }
                ],
                timestamp: new Date().toISOString()
            };
            
            lots.push(outputLot);
            
            // Record process
            processes.push({
                type: 'snowcapping',
                inputs: [
                    { lotId: flowerLotId, quantity: flowerQty },
                    { lotId: isolateLotId, quantity: isolateQty }
                ],
                output: outputLotId,
                date: document.getElementById('snowcapDate').value,
                notes: document.getElementById('snowcapNotes').value,
                timestamp: new Date().toISOString()
            });
            
            addToChainOfCustody(outputLotId, 'snowcapping', `Created by snowcapping ${flowerLotId} with ${isolateLotId}`, outputLot);
            addToChainOfCustody(flowerLotId, 'used', `Used ${flowerQty} ${flowerLot.unit} for snowcapping into ${outputLotId}`, {});
            addToChainOfCustody(isolateLotId, 'used', `Used ${isolateQty} ${isolateLot.unit} for snowcapping into ${outputLotId}`, {});
            
            saveData();
            
            alert('✓ Snowcapping completed successfully!');
            snowcappingForm.reset();
            updateProcessSection();
        });
    }
    
    // Blending form submission
    const blendingForm = document.getElementById('blendingFormElement');
    if (blendingForm) {
        blendingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const outputLotId = document.getElementById('blendOutputLot').value;
            const blendType = document.getElementById('blendType').value;
            const outputQty = parseFloat(document.getElementById('blendOutputQty').value);
            
            if (lots.find(l => l.id === outputLotId)) {
                alert('Output lot ID already exists');
                return;
            }
            
            // Collect source extracts
            const sources = [];
            let totalInput = 0;
            let hasError = false;
            
            document.querySelectorAll('.blend-source').forEach(sourceDiv => {
                const lotId = sourceDiv.querySelector('.blend-source-lot').value;
                const qty = parseFloat(sourceDiv.querySelector('.blend-source-qty').value);
                
                if (!lotId || !qty) {
                    hasError = true;
                    return;
                }
                
                const lot = lots.find(l => l.id === lotId);
                if (!lot || qty > lot.quantity) {
                    alert(`Insufficient quantity for lot ${lotId}`);
                    hasError = true;
                    return;
                }
                
                sources.push({ lotId, quantity: qty, unit: lot.unit });
                totalInput += qty;
            });
            
            if (hasError || sources.length === 0) {
                alert('Please provide valid source extracts');
                return;
            }
            
            // Update source lots
            sources.forEach(source => {
                const lot = lots.find(l => l.id === source.lotId);
                lot.quantity -= source.quantity;
                if (lot.quantity <= 0) lot.status = 'depleted';
                addToChainOfCustody(source.lotId, 'used', `Used ${source.quantity} ${source.unit} for blending into ${outputLotId}`, {});
            });
            
            // Create output lot
            const outputLot = {
                id: outputLotId,
                category: 'Concentrates',
                quantity: outputQty,
                originalQuantity: outputQty,
                unit: sources[0].unit,
                date: document.getElementById('blendDate').value,
                vendor: 'Internal Processing',
                productType: blendType,
                notes: document.getElementById('blendNotes').value,
                status: 'active',
                type: 'processed',
                processType: 'blending',
                inputs: sources,
                timestamp: new Date().toISOString()
            };
            
            lots.push(outputLot);
            
            // Record process
            processes.push({
                type: 'blending',
                inputs: sources,
                output: outputLotId,
                blendType,
                date: document.getElementById('blendDate').value,
                notes: document.getElementById('blendNotes').value,
                timestamp: new Date().toISOString()
            });
            
            addToChainOfCustody(outputLotId, 'blending', `Created by blending ${sources.length} extracts`, outputLot);
            
            saveData();
            
            alert('✓ Blending completed successfully!');
            blendingForm.reset();
            updateProcessSection();
        });
    }
    
    // Conversion form submission
    const conversionForm = document.getElementById('conversionFormElement');
    if (conversionForm) {
        conversionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const sourceLotId = document.getElementById('conversionSourceLot').value;
            const sourceQty = parseFloat(document.getElementById('conversionSourceQty').value);
            const productType = document.getElementById('conversionProductType').value;
            const outputLotId = document.getElementById('conversionOutputLot').value;
            const units = parseInt(document.getElementById('conversionUnits').value);
            const unitSize = document.getElementById('conversionUnitSize').value;
            
            const sourceLot = lots.find(lot => lot.id === sourceLotId);
            
            if (!sourceLot) {
                alert('Please select a valid source lot');
                return;
            }
            
            if (sourceQty > sourceLot.quantity) {
                alert('Insufficient source quantity');
                return;
            }
            
            if (lots.find(l => l.id === outputLotId)) {
                alert('Output lot ID already exists');
                return;
            }
            
            // Update source lot
            sourceLot.quantity -= sourceQty;
            if (sourceLot.quantity <= 0) sourceLot.status = 'depleted';
            
            // Determine output category
            let outputCategory = 'Edibles';
            if (productType === 'vapes') outputCategory = 'Concentrates';
            else if (productType === 'flower' || productType === 'prerolls') outputCategory = 'Plant Material';
            else if (productType === 'beverages' || productType === 'gummies') outputCategory = 'Edibles';
            
            // Create output lot
            const outputLot = {
                id: outputLotId,
                category: outputCategory,
                quantity: units,
                originalQuantity: units,
                unit: 'units',
                unitSize: unitSize,
                date: document.getElementById('conversionDate').value,
                vendor: 'Internal Processing',
                productType: productType,
                notes: document.getElementById('conversionNotes').value,
                status: 'active',
                type: 'processed',
                processType: 'conversion',
                inputs: [{ lotId: sourceLotId, quantity: sourceQty }],
                timestamp: new Date().toISOString()
            };
            
            lots.push(outputLot);
            
            // Record process
            processes.push({
                type: 'conversion',
                input: { lotId: sourceLotId, quantity: sourceQty },
                output: outputLotId,
                productType,
                units,
                unitSize,
                date: document.getElementById('conversionDate').value,
                notes: document.getElementById('conversionNotes').value,
                timestamp: new Date().toISOString()
            });
            
            addToChainOfCustody(outputLotId, 'conversion', `Converted from ${sourceLotId} into ${units} units of ${productType}`, outputLot);
            addToChainOfCustody(sourceLotId, 'used', `Used ${sourceQty} ${sourceLot.unit} for conversion into ${outputLotId}`, {});
            
            saveData();
            
            alert('✓ Conversion completed successfully!');
            conversionForm.reset();
            updateProcessSection();
        });
    }
});

function addBlendSource() {
    const container = document.getElementById('blendSourcesContainer');
    const div = document.createElement('div');
    div.className = 'blend-source mb-2 p-3 border rounded';
    div.innerHTML = `
        <div class="row g-2">
            <div class="col-md-6">
                <select class="form-control blend-source-lot" required>
                    <option value="">-- Select extract lot --</option>
                </select>
            </div>
            <div class="col-md-4">
                <input type="number" step="0.01" class="form-control blend-source-qty" placeholder="Quantity" required>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger w-100" onclick="removeBlendSource(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(div);
    populateProcessDropdowns();
}

function removeBlendSource(button) {
    button.closest('.blend-source').remove();
}

function updateProcessTable() {
    const tbody = document.getElementById('processTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    processes.reverse().slice(0, 20).forEach(proc => {
        let inputsStr = '';
        let detailsStr = '';
        
        if (proc.type === 'snowcapping') {
            inputsStr = proc.inputs.map(i => `${i.lotId} (${i.quantity})`).join(', ');
            detailsStr = 'Snowcapped flower';
        } else if (proc.type === 'blending') {
            inputsStr = proc.inputs.map(i => `${i.lotId} (${i.quantity})`).join(', ');
            detailsStr = proc.blendType;
        } else if (proc.type === 'conversion') {
            inputsStr = `${proc.input.lotId} (${proc.input.quantity})`;
            detailsStr = `${proc.units} units of ${proc.productType}`;
        } else {
            inputsStr = proc.parentLot || 'N/A';
            detailsStr = proc.childLots ? proc.childLots.join(', ') : 'N/A';
        }
        
        tbody.innerHTML += `
            <tr>
                <td><span class="badge bg-primary">${proc.type}</span></td>
                <td>${inputsStr}</td>
                <td>${proc.output || 'Multiple'}</td>
                <td>${proc.date}</td>
                <td>${detailsStr}</td>
            </tr>
        `;
    });
}

// ========================================
// Output/Ship Functions
// ========================================

function updateShipmentSection() {
    const select = document.getElementById('shipmentLot');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select lot --</option>';
    
    const activeLots = lots.filter(lot => lot.status === 'active' && lot.quantity > 0);
    activeLots.forEach(lot => {
        select.innerHTML += `<option value="${lot.id}">${lot.id} - ${lot.category} (${lot.quantity} ${lot.unit})</option>`;
    });
    
    document.getElementById('shipmentDate').value = new Date().toISOString().split('T')[0];
    
    updateShipmentTable();
}

document.addEventListener('DOMContentLoaded', function() {
    const shipmentForm = document.getElementById('shipmentForm');
    if (shipmentForm) {
        shipmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const lotId = document.getElementById('shipmentLot').value;
            const qty = parseFloat(document.getElementById('shipmentQty').value);
            const recipient = document.getElementById('shipmentRecipient').value;
            const date = document.getElementById('shipmentDate').value;
            
            const lot = lots.find(l => l.id === lotId);
            
            if (!lot) {
                alert('Please select a valid lot');
                return;
            }
            
            if (qty > lot.quantity) {
                alert('Insufficient quantity in lot');
                return;
            }
            
            // Update lot
            lot.quantity -= qty;
            if (lot.quantity <= 0) {
                lot.status = 'depleted';
            }
            
            // Record shipment with all master ledger fields
            const shipment = {
                lotId,
                quantity: qty,
                unit: lot.unit,
                recipient,
                date,
                tracking: document.getElementById('shipmentTracking').value,
                carrier: document.getElementById('shipmentCarrier').value,
                notes: document.getElementById('shipmentNotes').value,
                // Master Ledger CSV fields
                shipToName: document.getElementById('shipmentShipToName').value,
                shipToAddress: document.getElementById('shipmentShipToAddress').value,
                shipToCity: document.getElementById('shipmentShipToCity').value,
                shipToState: document.getElementById('shipmentShipToState').value,
                shipToZIP: document.getElementById('shipmentShipToZIP').value,
                upsWebGateId: document.getElementById('shipmentUPSWebGateId').value,
                routing: document.getElementById('shipmentRouting').value,
                pricePerUOM: document.getElementById('shipmentPricePerUOM').value,
                extendedTotal: document.getElementById('shipmentExtendedTotal').value,
                paymentStatus: document.getElementById('shipmentPaymentStatus').value,
                packetComplete: document.getElementById('shipmentPacketComplete').value,
                carrierLetter: document.getElementById('shipmentCarrierLetter').value,
                licenseCopy: document.getElementById('shipmentLicenseCopy').value,
                countVerified: document.getElementById('shipmentCountVerified').value,
                finalSignOff: document.getElementById('shipmentFinalSignOff').value,
                archiveLink: document.getElementById('shipmentArchiveLink').value,
                timestamp: new Date().toISOString()
            };
            
            shipments.push(shipment);
            
            addToChainOfCustody(lotId, 'shipped', `Shipped ${qty} ${lot.unit} to ${recipient}`, shipment);
            
            saveData();
            
            alert('✓ Shipment recorded successfully!');
            shipmentForm.reset();
            updateShipmentSection();
        });
    }
});

function updateShipmentTable() {
    const tbody = document.getElementById('shipmentTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    shipments.reverse().slice(0, 20).forEach(shipment => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${shipment.lotId}</strong></td>
                <td>${shipment.quantity} ${shipment.unit}</td>
                <td>${shipment.recipient}</td>
                <td>${shipment.date}</td>
                <td>${shipment.tracking || 'N/A'}</td>
                <td><span class="badge bg-success">Shipped</span></td>
            </tr>
        `;
    });
}

// ========================================
// Testing/Verification Functions
// ========================================

function updateTestingSection() {
    const select = document.getElementById('testingLot');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select lot --</option>';
    
    lots.forEach(lot => {
        select.innerHTML += `<option value="${lot.id}">${lot.id} - ${lot.category}</option>`;
    });
    
    document.getElementById('testingCheckedDate').value = new Date().toISOString().split('T')[0];
    
    updateTestingTable();
}

document.addEventListener('DOMContentLoaded', function() {
    const testingForm = document.getElementById('testingForm');
    if (testingForm) {
        testingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const lotId = document.getElementById('testingLot').value;
            const lot = lots.find(l => l.id === lotId);
            
            if (!lot) {
                alert('Please select a valid lot');
                return;
            }
            
            // Record testing/verification
            const testing = {
                lotId,
                stateCheck: document.getElementById('testingStateCheck').value,
                checkedBy: document.getElementById('testingCheckedBy').value,
                checkedDate: document.getElementById('testingCheckedDate').value,
                thynkBrainConsulted: document.getElementById('testingThynkBrainConsulted').value,
                thynkBrainNotes: document.getElementById('testingThynkBrainNotes').value,
                timestamp: new Date().toISOString()
            };
            
            testingRecords.push(testing);
            
            // Update lot with testing info
            lot.stateCheck = testing.stateCheck;
            lot.checkedBy = testing.checkedBy;
            lot.checkedDate = testing.checkedDate;
            lot.thynkBrainConsulted = testing.thynkBrainConsulted;
            lot.thynkBrainNotes = testing.thynkBrainNotes;
            
            addToChainOfCustody(lotId, 'testing', `State Check: ${testing.stateCheck} by ${testing.checkedBy}`, testing);
            
            saveData();
            
            alert('✓ Verification recorded successfully!');
            testingForm.reset();
            updateTestingSection();
        });
    }
});

function updateTestingTable() {
    const tbody = document.getElementById('testingTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    testingRecords.slice().reverse().slice(0, 20).forEach(testing => {
        tbody.innerHTML += `
            <tr>
                <td>${testing.lotId}</td>
                <td><span class="badge bg-${testing.stateCheck === 'PASS' ? 'success' : testing.stateCheck === 'FAIL' ? 'danger' : 'warning'}">${testing.stateCheck || 'N/A'}</span></td>
                <td>${testing.checkedBy || 'N/A'}</td>
                <td>${testing.checkedDate || 'N/A'}</td>
                <td>${testing.thynkBrainConsulted || 'N/A'}</td>
            </tr>
        `;
    });
}

// ========================================
// Inventory Functions
// ========================================

function updateInventoryView() {
    filterInventory(currentInventoryFilter);
}

function filterInventory(filter) {
    currentInventoryFilter = filter;
    
    // Update button states
    document.querySelectorAll('#inventory .btn-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let filteredLots = lots;
    if (filter !== 'all') {
        filteredLots = lots.filter(lot => lot.category === filter);
    }
    
    filteredLots.forEach(lot => {
        const statusBadge = lot.status === 'active' ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-secondary">Depleted</span>';
        
        const lastUpdated = new Date(lot.timestamp).toLocaleDateString();
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${lot.id}</strong></td>
                <td><span class="category-badge bg-primary text-white">${lot.category}</span></td>
                <td>${lot.quantity} ${lot.unit}</td>
                <td>${lot.originalQuantity} ${lot.unit}</td>
                <td>${statusBadge}</td>
                <td>${lastUpdated}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewLotDetails('${lot.id}')">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    });
}

function viewLotDetails(lotId) {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;
    
    let details = `
LOT DETAILS
===========
Lot ID: ${lot.id}
Category: ${lot.category}
Current Quantity: ${lot.quantity} ${lot.unit}
Original Quantity: ${lot.originalQuantity} ${lot.unit}
Status: ${lot.status}
Date: ${lot.date}
Vendor: ${lot.vendor}
Product Type: ${lot.productType || 'N/A'}
Cannabinoid Profile: ${lot.cannabinoidProfile || 'N/A'}
Notes: ${lot.notes || 'N/A'}
`;
    
    alert(details);
}

// ========================================
// Reports Functions
// ========================================

function updateReportsSection() {
    const select = document.getElementById('custodyLotSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select a lot --</option>';
    lots.forEach(lot => {
        select.innerHTML += `<option value="${lot.id}">${lot.id} - ${lot.category}</option>`;
    });
}

function exportAllData() {
    const data = {
        lots,
        processes,
        shipments,
        chainOfCustody,
        testingRecords,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hemp-traceability-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✓ Data exported successfully!');
}

function exportMasterLedgerCSV() {
    // Define CSV columns based on master ledger requirements
    const headers = [
        'Invoice #', 'Monday Item ID', 'Monday Link', 'Invoice Date', 'Customer Name',
        'Ship-To Name', 'Ship-To Address', 'Ship-To City', 'Ship-To State', 'Ship-To ZIP',
        'Product Type', 'Product / SKU', 'Lot Identifier', 'UOM', 'Qty', 'Price / UOM', 'Extended Total',
        'Payment Status', 'State Check (PASS/FAIL/CONFIRM)', 'Checked By', 'Checked Date',
        'Thynk Brain™ Consulted (Y/N)', 'Thynk Brain™ Reference / Notes',
        'Routing (Standard vs Depot)', 'Carrier', 'UPS WebGate Shipment ID', 'Tracking #', 'Ship Date',
        'COA Link', 'COA Match Verified (Y/N)', 'Packet Complete (Y/N)',
        'Carrier Attention Letter Included (Y/N)', 'License Copy Included (Y/N)',
        'Count Verified (Y/N)', 'Final Sign-Off', 'Archive Folder Link', 'Notes / Exception Flag'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    // Combine data from lots, shipments, and testing records
    lots.forEach(lot => {
        // Find related shipment
        const shipment = shipments.find(s => s.lotId === lot.id);
        
        const row = [
            escapeCSV(lot.invoiceNum || ''),
            escapeCSV(lot.mondayItemId || ''),
            escapeCSV(lot.mondayLink || ''),
            escapeCSV(lot.invoiceDate || ''),
            escapeCSV(lot.customerName || ''),
            escapeCSV(shipment?.shipToName || ''),
            escapeCSV(shipment?.shipToAddress || ''),
            escapeCSV(shipment?.shipToCity || ''),
            escapeCSV(shipment?.shipToState || ''),
            escapeCSV(shipment?.shipToZIP || ''),
            escapeCSV(lot.productType || ''),
            escapeCSV(lot.productSKU || ''),
            escapeCSV(lot.lotIdentifier || lot.id),
            escapeCSV(lot.unit || ''),
            escapeCSV(lot.quantity || ''),
            escapeCSV(shipment?.pricePerUOM || ''),
            escapeCSV(shipment?.extendedTotal || ''),
            escapeCSV(shipment?.paymentStatus || ''),
            escapeCSV(lot.stateCheck || ''),
            escapeCSV(lot.checkedBy || ''),
            escapeCSV(lot.checkedDate || ''),
            escapeCSV(lot.thynkBrainConsulted || ''),
            escapeCSV(lot.thynkBrainNotes || ''),
            escapeCSV(shipment?.routing || ''),
            escapeCSV(shipment?.carrier || ''),
            escapeCSV(shipment?.upsWebGateId || ''),
            escapeCSV(shipment?.tracking || ''),
            escapeCSV(shipment?.date || ''),
            escapeCSV(lot.coaLink || ''),
            escapeCSV(lot.coaMatchVerified || ''),
            escapeCSV(shipment?.packetComplete || ''),
            escapeCSV(shipment?.carrierLetter || ''),
            escapeCSV(shipment?.licenseCopy || ''),
            escapeCSV(shipment?.countVerified || ''),
            escapeCSV(shipment?.finalSignOff || ''),
            escapeCSV(shipment?.archiveLink || ''),
            escapeCSV(lot.notes || '')
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✓ Master Ledger CSV exported successfully!');
}

function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
}

function importMasterLedgerCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = parseCSVLine(lines[0]);
            
            let importedCount = 0;
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = parseCSVLine(lines[i]);
                if (values.length < headers.length) continue;
                
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                
                // Create or update lot
                const lotId = row['Lot Identifier'] || `LOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                let lot = lots.find(l => l.id === lotId);
                
                if (!lot) {
                    lot = {
                        id: lotId,
                        category: row['Product Type'] || 'Unknown',
                        quantity: parseFloat(row['Qty']) || 0,
                        originalQuantity: parseFloat(row['Qty']) || 0,
                        unit: row['UOM'] || 'units',
                        status: 'active',
                        type: 'intake',
                        timestamp: new Date().toISOString()
                    };
                    lots.push(lot);
                }
                
                // Update lot with CSV data
                lot.invoiceNum = row['Invoice #'];
                lot.mondayItemId = row['Monday Item ID'];
                lot.mondayLink = row['Monday Link'];
                lot.invoiceDate = row['Invoice Date'];
                lot.customerName = row['Customer Name'];
                lot.productType = row['Product Type'];
                lot.productSKU = row['Product / SKU'];
                lot.lotIdentifier = row['Lot Identifier'];
                lot.coaLink = row['COA Link'];
                lot.coaMatchVerified = row['COA Match Verified (Y/N)'];
                lot.stateCheck = row['State Check (PASS/FAIL/CONFIRM)'];
                lot.checkedBy = row['Checked By'];
                lot.checkedDate = row['Checked Date'];
                lot.thynkBrainConsulted = row['Thynk Brain™ Consulted (Y/N)'];
                lot.thynkBrainNotes = row['Thynk Brain™ Reference / Notes'];
                lot.notes = row['Notes / Exception Flag'];
                
                // Create shipment if ship data exists
                if (row['Ship Date'] || row['Tracking #']) {
                    const existingShipment = shipments.find(s => s.lotId === lotId && s.date === row['Ship Date'] && s.tracking === row['Tracking #']);
                    if (!existingShipment) {
                        const shipment = {
                            lotId: lotId,
                            date: row['Ship Date'],
                            tracking: row['Tracking #'],
                            carrier: row['Carrier'] || '',
                            shipToName: row['Ship-To Name'],
                            shipToAddress: row['Ship-To Address'],
                            shipToCity: row['Ship-To City'],
                            shipToState: row['Ship-To State'],
                            shipToZIP: row['Ship-To ZIP'],
                            upsWebGateId: row['UPS WebGate Shipment ID'],
                            routing: row['Routing (Standard vs Depot)'],
                            pricePerUOM: row['Price / UOM'],
                            extendedTotal: row['Extended Total'],
                            paymentStatus: row['Payment Status'],
                            packetComplete: row['Packet Complete (Y/N)'],
                            carrierLetter: row['Carrier Attention Letter Included (Y/N)'],
                            licenseCopy: row['License Copy Included (Y/N)'],
                            countVerified: row['Count Verified (Y/N)'],
                            finalSignOff: row['Final Sign-Off'],
                            archiveLink: row['Archive Folder Link'],
                            timestamp: new Date().toISOString()
                        };
                        shipments.push(shipment);
                    }
                }
                
                importedCount++;
            }
            
            saveData();
            alert(`✓ Successfully imported ${importedCount} records from CSV!`);
            showSection('dashboard');
            
        } catch (error) {
            alert('Error importing CSV: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

function parseCSVLine(line) {
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

function generateSummaryReport() {
    const activeLots = lots.filter(lot => lot.status === 'active');
    const depletedLots = lots.filter(lot => lot.status === 'depleted');
    
    const categoryBreakdown = {};
    lots.forEach(lot => {
        if (!categoryBreakdown[lot.category]) {
            categoryBreakdown[lot.category] = { count: 0, quantity: 0 };
        }
        categoryBreakdown[lot.category].count++;
        if (lot.status === 'active') {
            categoryBreakdown[lot.category].quantity += lot.quantity;
        }
    });
    
    let report = `
HEMP TRACEABILITY SYSTEM - SUMMARY REPORT
==========================================
Generated: ${new Date().toLocaleString()}

OVERVIEW
--------
Total Lots: ${lots.length}
Active Lots: ${activeLots.length}
Depleted Lots: ${depletedLots.length}
Total Processes: ${processes.length}
Total Shipments: ${shipments.length}

CATEGORY BREAKDOWN
------------------
`;
    
    Object.keys(categoryBreakdown).forEach(category => {
        const data = categoryBreakdown[category];
        report += `${category}: ${data.count} lots (Active quantity varies by unit)\n`;
    });
    
    report += `
PROCESS BREAKDOWN
-----------------
Snowcapping: ${processes.filter(p => p.type === 'snowcapping').length}
Blending: ${processes.filter(p => p.type === 'blending').length}
Conversion: ${processes.filter(p => p.type === 'conversion').length}
Subdivide: ${processes.filter(p => p.type === 'subdivide').length}

RECENT ACTIVITY
---------------
Last 5 Processes:
`;
    
    processes.slice(-5).reverse().forEach(proc => {
        report += `  - ${proc.type} on ${proc.date}\n`;
    });
    
    document.getElementById('reportOutput').style.display = 'block';
    document.getElementById('reportContent').textContent = report;
}

function showChainOfCustody() {
    const lotId = document.getElementById('custodyLotSelect').value;
    if (!lotId) {
        document.getElementById('chainOfCustodyDisplay').innerHTML = '';
        return;
    }
    
    const entries = chainOfCustody.filter(entry => entry.lotId === lotId);
    
    if (entries.length === 0) {
        document.getElementById('chainOfCustodyDisplay').innerHTML = 
            '<div class="alert alert-warning">No chain of custody records found for this lot.</div>';
        return;
    }
    
    let html = '<div class="mt-3">';
    entries.forEach((entry, index) => {
        html += `
            <div class="chain-of-custody">
                <strong>${index + 1}. ${entry.action}</strong><br>
                ${entry.description}<br>
                <small class="text-muted">${new Date(entry.timestamp).toLocaleString()}</small>
            </div>
        `;
    });
    html += '</div>';
    
    document.getElementById('chainOfCustodyDisplay').innerHTML = html;
}

// ========================================
// Chain of Custody
// ========================================

function addToChainOfCustody(lotId, action, description, data) {
    chainOfCustody.push({
        lotId,
        action,
        description,
        data,
        timestamp: new Date().toISOString()
    });
}

// ========================================
// Data Persistence
// ========================================

function saveData() {
    localStorage.setItem('lots', JSON.stringify(lots));
    localStorage.setItem('processes', JSON.stringify(processes));
    localStorage.setItem('shipments', JSON.stringify(shipments));
    localStorage.setItem('chainOfCustody', JSON.stringify(chainOfCustody));
    localStorage.setItem('testingRecords', JSON.stringify(testingRecords));
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
});
