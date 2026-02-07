// Simple Bootstrap-like functionality

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active to clicked tab
            this.classList.add('active');
            const target = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(target);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });
});

// Modal functionality
class Modal {
    constructor(element) {
        this.element = element;
        this.isShown = false;
    }
    
    show() {
        this.element.classList.add('show');
        this.element.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.isShown = true;
    }
    
    hide() {
        this.element.classList.remove('show');
        this.element.style.display = 'none';
        document.body.style.overflow = '';
        this.isShown = false;
    }
    
    static getInstance(element) {
        if (!element._modalInstance) {
            element._modalInstance = new Modal(element);
        }
        return element._modalInstance;
    }
}

// Bootstrap-like modal object
const bootstrap = {
    Modal: Modal
};

// Close modal on backdrop click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modal = Modal.getInstance(e.target);
        if (modal && modal.isShown) {
            modal.hide();
        }
    }
});

// Close modal on close button click
document.addEventListener('DOMContentLoaded', function() {
    const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                const modalInstance = Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
    });
});
