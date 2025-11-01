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
        // A slight style change for a smoother scroll effect on the header
        const isScrolled = window.scrollY > 50;
        header.style.boxShadow = isScrolled ? '0 5px 15px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.1)';
        header.style.padding = isScrolled ? '5px 0' : '15px 0';
    }
});

// --- ACTIVE NAVIGATION LINK HIGHLIGHTER (FINAL, SIMPLIFIED VERSION) ---
window.addEventListener('load', () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Get just the filename (e.g., "about.html" or "" for the root)
    let currentPage = currentPath.split("/").pop();

    // If the path ends in a slash (like on the live server root), it will be empty.
    // In that case, we default to "index.html".
    if (currentPage === "") {
        currentPage = "index.html";
    }

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');

        // First, remove active class from all links to prevent duplicates
        link.classList.remove('active-link');

        // Check for a direct match
        if (linkPage === currentPage) {
            link.classList.add('active-link');
        }
    });

    // Special case: If we are on post.html, highlight the 'Blog' link instead.
    if (currentPage === 'post.html') {
        const blogLink = document.querySelector('.nav-menu a[href="blog.html"]');
        if (blogLink) {
            // Remove active from post.html if it somehow got it, and add to blog.html
            const postLink = document.querySelector('.nav-menu a[href="post.html"]');
            if (postLink) postLink.classList.remove('active-link');
            blogLink.classList.add('active-link');
        }
    }
});