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
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            header.style.padding = '5px 0';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            header.style.padding = '15px 0';
        }
    }
});

// --- ACTIVE NAVIGATION LINK HIGHLIGHTER (ROBUST VERSION) ---
window.addEventListener('load', () => {
    const currentUrl = window.location.href;
    const navLinks = document.querySelectorAll('.nav-menu a');

    let isHomepage = true; // Assume we are on the homepage by default

    navLinks.forEach(link => {
        const linkUrl = link.href;

        // Check if the link's URL is part of the current page's URL
        // We exclude the homepage link from this initial check
        if (currentUrl.includes(link.getAttribute('href')) && link.getAttribute('href') !== 'index.html') {
            link.classList.add('active-link');
            isHomepage = false; // If any other link is active, it's not the homepage
        }

        // Special check for the single post page to highlight the "Blog" link
        if (currentUrl.includes('post.html') && link.getAttribute('href') === 'blog.html') {
            link.classList.add('active-link');
            isHomepage = false;
        }
    });

    // If no other link was activated, it must be the homepage
    if (isHomepage) {
        document.querySelector('.nav-menu a[href="index.html"]').classList.add('active-link');
    }
});