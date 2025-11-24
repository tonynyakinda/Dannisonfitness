// events.js - Event loading and management functions for Dannisonfitness website
import { supabase } from './supabaseClient.js';

/**
 * Loads preview of upcoming events for the homepage (max 3 events)
 */
async function loadHomepageEvents() {
    const container = document.getElementById('home-events-grid');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(3);

    if (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p>Unable to load events at this time.</p>';
        return;
    }

    if (!events || events.length === 0) {
        container.innerHTML = '<p>No upcoming events at the moment. Check back soon!</p>';
        return;
    }

    container.innerHTML = '';
    events.forEach(event => {
        const eventDate = new Date(event.event_date);
        const eventCard = `
            <div class="event-card" data-status="upcoming">
                <div class="event-poster">
                    <img src="${event.poster_url}" alt="${event.title}">
                    <span class="event-date-badge">
                        <span class="day">${eventDate.getDate()}</span>
                        <span class="month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </span>
                </div>
                <div class="event-content">
                    <div class="event-meta">
                        <span class="event-badge ${event.event_type || 'special'}">${event.event_type || 'Event'}</span>
                        <span class="event-time"><i class="far fa-clock"></i> ${event.event_time}</span>
                    </div>
                    <h3>${event.title}</h3>
                    <p>${event.description ? event.description.substring(0, 100) + '...' : ''}</p>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    <a href="events.html" class="btn btn-primary">View Details</a>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', eventCard);
    });
}

/**
 * Loads all events for the events page with filtering
 */
async function loadEventsPage() {
    const container = document.getElementById('events-grid');
    if (!container) return;

    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

    if (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p>Unable to load events at this time.</p>';
        return;
    }

    if (!events || events.length === 0) {
        container.innerHTML = '<p>No events found. Check back soon for exciting fitness events!</p>';
        return;
    }

    container.innerHTML = '';
    events.forEach(event => {
        const eventDate = new Date(event.event_date);
        const isPast = event.status === 'past' || new Date(event.event_date) < new Date();

        const eventCard = `
            <div class="event-card clickable-event" data-status="${isPast ? 'past' : event.status}" data-event-id="${event.id}">
                <div class="event-poster">
                    <img src="${event.poster_url}" alt="${event.title}">
                    <span class="event-date-badge ${isPast ? 'past' : ''}">
                        <span class="day">${eventDate.getDate()}</span>
                        <span class="month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </span>
                </div>
                <div class="event-content">
                    <div class="event-meta">
                        <span class="event-badge ${event.event_type || 'special'}">${event.event_type || 'Event'}</span>
                        <span class="event-time"><i class="far fa-clock"></i> ${event.event_time}</span>
                    </div>
                    <h3>${event.title}</h3>
                    <p>${event.description || ''}</p>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    ${isPast ?
                '<span class="event-status-badge">Event Completed</span>' :
                '<a href="#" class="btn btn-primary event-register-btn">Register Now</a>'}
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', eventCard);
    });

    // Add click handlers for event registration
    setupEventClickHandlers();
    setupEventFilters();
}

/**
 * Sets up click handlers for event posters to show booking modal
 */
function setupEventClickHandlers() {
    const eventCards = document.querySelectorAll('.clickable-event');

    eventCards.forEach(card => {
        const registerBtn = card.querySelector('.event-register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const eventId = card.dataset.eventId;
                await showEventBookingModal(eventId);
            });
        }
    });
}

/**
 * Shows the event booking modal for a specific event
 */
async function showEventBookingModal(eventId) {
    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error || !event) {
        window.showAlert('Unable to load event details.', 'error');
        return;
    }

    // Create modal if it doesn't exist
    let modal = document.getElementById('event-booking-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'event-booking-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const eventDate = new Date(event.event_date);

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="booking-form">
                <h2>Register for ${event.title}</h2>
                <div class="event-details-summary">
                    <p><strong><i class="far fa-calendar"></i> Date:</strong> ${eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong><i class="far fa-clock"></i> Time:</strong> ${event.event_time}</p>
                    <p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ${event.location}</p>
                </div>
                <form id="event-booking-form" data-event-id="${event.id}">
                    <div class="form-group">
                        <label for="event-name">Full Name</label>
                        <input type="text" id="event-name" name="full_name" required>
                    </div>
                    <div class="form-group">
                        <label for="event-email">Email Address</label>
                        <input type="email" id="event-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="event-phone">Phone Number</label>
                        <input type="tel" id="event-phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="event-participants">Number of Participants</label>
                        <input type="number" id="event-participants" name="number_of_participants" min="1" value="1" required>
                    </div>
                    <div class="form-group">
                        <label for="event-message">Additional Information (Optional)</label>
                        <textarea id="event-message" name="message" rows="4"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Complete Registration</button>
                </form>
            </div>
        </div>
    `;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Close modal handlers
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Handle form submission
    const form = modal.querySelector('#event-booking-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            event_id: eventId,
            full_name: form.querySelector('[name="full_name"]').value,
            email: form.querySelector('[name="email"]').value,
            phone: form.querySelector('[name="phone"]').value,
            number_of_participants: parseInt(form.querySelector('[name="number_of_participants"]').value),
            message: form.querySelector('[name="message"]').value,
        };

        const { error: insertError } = await supabase
            .from('event_bookings')
            .insert([formData]);

        if (insertError) {
            console.error('Error submitting event booking:', insertError);
            window.showAlert('Sorry, there was an error processing your registration. Please try again.', 'error');
        } else {
            window.showAlert('Thank you for registering! We will contact you soon with more details.', 'success');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            form.reset();
        }
    });
}

/**
 * Sets up event filter buttons on the events page
 */
function setupEventFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter event cards
            eventCards.forEach(card => {
                const status = card.dataset.status;
                if (filter === 'all') {
                    card.style.display = '';
                } else if (filter === status) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize events when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadHomepageEvents();
    loadEventsPage();
});
