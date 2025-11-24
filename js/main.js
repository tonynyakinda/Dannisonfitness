// Filename: main.js | Path: C:\Users\cyber\Downloads\Dannisonfitness\js\main.js
// js/main.js (FINAL, SELF-CONTAINED VERSION)

// =========================================================================
// === UI HELPER FUNCTIONS - SELF-CONTAINED HERE ===
// =========================================================================

/**
 * Displays a custom toast notification.
 * This function is attached to the window object to be globally accessible.
 */
window.showAlert = function (message, type = 'info', duration = 5000) {
    const customAlert = document.getElementById('custom-alert');
    if (!customAlert) {
        console.error("Custom alert element not found in the DOM.");
        // Fallback to a standard browser alert if our custom one is missing
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    const alertMessage = customAlert.querySelector('.alert-message');

    // Use a static variable on the function to hold the timeout
    clearTimeout(window.showAlert.timeout);

    alertMessage.textContent = message;
    customAlert.className = 'custom-alert'; // Reset classes
    customAlert.classList.add(`alert-${type}`);
    customAlert.classList.add('active');

    window.showAlert.timeout = setTimeout(() => {
        customAlert.classList.remove('active');
    }, duration);

    const closeButton = customAlert.querySelector('.close-alert');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            clearTimeout(window.showAlert.timeout);
            customAlert.classList.remove('active');
        }, { once: true });
    }
};


// =========================================================================
// === MAIN SITE LOGIC ===
// =========================================================================

// --- Mobile Navigation Toggle ---
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
        if (!n.classList.contains('book-now-btn')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }));
}

// --- Smooth scrolling for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.classList.contains('book-now-btn')) {
            return;
        }
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// --- Sticky header on scroll ---
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});