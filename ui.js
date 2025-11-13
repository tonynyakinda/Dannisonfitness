// js/ui.js (NEW FILE for client site)

document.addEventListener('DOMContentLoaded', () => {
    // --- CUSTOM ALERT (TOAST) LOGIC ---
    const customAlert = document.getElementById('custom-alert');
    if (!customAlert) return; // If the alert HTML isn't on the page, do nothing

    let alertTimeout;

    // Make the showAlert function globally available
    window.showAlert = function (message, type = 'info', duration = 5000) {
        const alertMessage = customAlert.querySelector('.alert-message');

        clearTimeout(alertTimeout);

        alertMessage.textContent = message;
        customAlert.className = 'custom-alert'; // Reset classes
        customAlert.classList.add(`alert-${type}`);
        customAlert.classList.add('active');

        alertTimeout = setTimeout(() => {
            customAlert.classList.remove('active');
        }, duration);
    };

    const closeButton = customAlert.querySelector('.close-alert');
    closeButton.addEventListener('click', () => {
        clearTimeout(alertTimeout);
        customAlert.classList.remove('active');
    });
});