// booking.js

// We need to create a Supabase client here too.
// NOTE: This assumes your `booking.js` is in the `js` folder.
import { supabase } from '../supabaseClient.js';

const bookingModal = document.getElementById('booking-modal');
const bookNowBtns = document.querySelectorAll('.book-now-btn, #hero-book-btn, #cta-book-btn');
const closeModal = document.querySelector('.close-modal');

bookNowBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        bookingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

if (closeModal) {
    closeModal.addEventListener('click', () => {
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const formData = {
            service: document.getElementById('service').value,
            full_name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
        };

        // Use Supabase to insert the data into the 'bookings' table
        const { error } = await supabase.from('bookings').insert([formData]);

        if (error) {
            console.error('Error submitting booking:', error);
            alert('Sorry, there was an error submitting your request. Please try again later.');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Booking Request';
        } else {
            alert('Thank you for your booking request! We will contact you shortly to confirm your appointment.');
            bookingModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            bookingForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Booking Request';
        }
    });
}