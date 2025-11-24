// Filename: booking.js | Path: C:\Users\cyber\Downloads\Dannisonfitness\js\booking.js
// This script assumes that 'supabase' is available because supabaseClient.js is loaded as a module,
// and that 'window.showAlert' is available because ui.js has been loaded as a standard script.

import { supabase } from '../supabaseClient.js';

// --- Get DOM Elements ---
const bookingModal = document.getElementById('booking-modal');
const bookNowBtns = document.querySelectorAll('.book-now-btn, #hero-book-btn, #cta-book-btn');
const closeModalBtn = document.querySelector('.close-modal');
const bookingForm = document.getElementById('booking-form');


// --- Modal Opening Logic ---
// Add event listeners to all "Book Now" or "Get Started" buttons
bookNowBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the default link behavior
        if (bookingModal) {
            bookingModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    });
});

// --- Modal Closing Logic ---
// 1. Close by clicking the 'x' button
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (bookingModal) {
            bookingModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// 2. Close by clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});


// --- Form Submission Logic ---
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from doing a default page refresh

        const submitButton = bookingForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Collect form data into an object
        const formData = {
            service: document.getElementById('service').value,
            full_name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
        };

        // Use Supabase to insert the data into the 'bookings' table
        const { error } = await supabase.from('bookings').insert([formData]);

        // Handle the response from Supabase
        if (error) {
            // If there's an error, show an error alert
            console.error('Error submitting booking:', error);
            window.showAlert('Sorry, there was an error submitting your request. Please try again later.', 'error');

            // Re-enable the button so the user can try again
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Booking Request';
        } else {
            // If successful, show a success alert
            window.showAlert('Thank you! We will contact you shortly to confirm.', 'success');

            // Close the modal, reset the form, and re-enable the button
            if (bookingModal) {
                bookingModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            bookingForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Booking Request';
        }
    });
}