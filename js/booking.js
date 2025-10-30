//booking.js  
// Booking Modal Functionality
const bookingModal = document.getElementById('booking-modal');
const bookNowBtns = document.querySelectorAll('.book-now-btn, #hero-book-btn, #cta-book-btn');
const closeModal = document.querySelector('.close-modal');

// Open modal when any book now button is clicked
bookNowBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        bookingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
});

// Close modal when X is clicked
if (closeModal) {
    closeModal.addEventListener('click', () => {
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
}

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
});

// Form submission
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real implementation, you would send this data to a server
        // For now, we'll just show an alert and close the modal
        alert('Thank you for your booking request! We will contact you shortly to confirm your appointment.');
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        bookingForm.reset();
    });
}