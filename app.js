// Load data from localStorage
let intakes = JSON.parse(localStorage.getItem('intakes')) || [];
let outputs = JSON.parse(localStorage.getItem('outputs')) || [];

// Update UI
function updateUI() {
    // Update intake table
    const intakeTable = document.getElementById('intakeTable').querySelector('tbody');
    intakeTable.innerHTML = '';
    intakes.forEach(item => {
        intakeTable.innerHTML += `<tr><td>${item.date}</td><td>${item.batch}</td><td>${item.amount}</td><td>${item.profile}</td></tr>`;
    });

    // Update output table
    const outputTable = document.getElementById('outputTable').querySelector('tbody');
    outputTable.innerHTML = '';
    outputs.forEach(item => {
        outputTable.innerHTML += `<tr><td>${item.batch}</td><td>${item.amount}</td><td>${item.conversion}</td><td>${item.vendor}</td></tr>`;
    });

    // Update batch dropdown
    const batchSelect = document.getElementById('outputBatch');
    batchSelect.innerHTML = '<option value="">Choose Batch</option>';
    intakes.forEach(item => {
        batchSelect.innerHTML += `<option value="${item.batch}">${item.batch} (${item.amount} lbs remaining)</option>`;
    });

    // Calculate inventory
    let totalIntake = intakes.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    let totalOutput = outputs.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    document.getElementById('inventory').textContent = `Total Remaining Crude Extract: ${(totalIntake - totalOutput).toFixed(1)} lbs`;

    // Save to localStorage
    localStorage.setItem('intakes', JSON.stringify(intakes));
    localStorage.setItem('outputs', JSON.stringify(outputs));
}

// Add intake
document.getElementById('intakeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const intake = {
        date: document.getElementById('intakeDate').value,
        batch: document.getElementById('batchId').value,
        amount: parseFloat(document.getElementById('amount').value),
        profile: document.getElementById('cannabinoidProfile').value
    };
    intakes.push(intake);
    updateUI();
    e.target.reset();
});

// Add output
document.getElementById('outputForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const output = {
        batch: document.getElementById('outputBatch').value,
        amount: parseFloat(document.getElementById('outputAmount').value),
        conversion: document.getElementById('conversion').value,
        vendor: document.getElementById('vendor').value
    };
    outputs.push(output);
    updateUI();
    e.target.reset();
});

// Quick select DiscountPharms
function quickSelectDiscountPharms() {
    document.getElementById('vendor').value = 'DiscountPharms';
}

// Initial load
updateUI();