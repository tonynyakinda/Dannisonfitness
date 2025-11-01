// js/main.js

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
        if (!n.classList.contains('book-now-btn')) { // Don't close if it's the booking button in the nav
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }));
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for fixed header height
                behavior: 'smooth'
            });
        }
    });
});

// Sticky header on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            header.style.padding = '5px 0';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            header.style.padding = '15px 0';
        }
    }
});

// --- ACTIVE NAVIGATION LINK HIGHLIGHTER (THIS WAS THE MISSING PIECE) ---
window.addEventListener('load', () => {
    // Get the filename of the current page (e.g., "blog.html")
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');

        // Special case for the homepage
        if ((currentPage === 'index.html' || currentPage === '') && linkPage === 'index.html') {
            link.classList.add('active-link');
        }
        // Logic for all other pages
        else if (linkPage !== 'index.html' && currentPage === linkPage) {
            link.classList.add('active-link');
        }
        // Logic for the single post page, to highlight "Blog"
        else if (currentPage === 'post.html' && linkPage === 'blog.html') {
            link.classList.add('active-link');
        }
    });
});