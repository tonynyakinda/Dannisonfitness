// js/main.js

// Mobile Navigation Toggle
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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Sticky header on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        const isScrolled = window.scrollY > 50;
        header.style.boxShadow = isScrolled ? '0 5px 15px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        header.style.padding = isScrolled ? '5px 0' : '15px 0';
    }
});

// --- ACTIVE NAVIGATION LINK HIGHLIGHTER (SIMPLE & CORRECT) ---
window.addEventListener('load', () => {
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === "") {
        currentPage = "index.html";
    }

    const navLinks = document.querySelectorAll('.nav-menu a');

    // First, clear any existing active classes
    navLinks.forEach(link => {
        link.classList.remove('active-link');
    });

    // Handle the single post page exception
    if (currentPage === 'post.html') {
        const blogLink = document.querySelector('a[href="blog.html"]');
        if (blogLink) {
            blogLink.classList.add('active-link');
        }
        return; // Stop here if it's a post page
    }

    // Find the link that exactly matches the current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active-link');
        }
    });
});