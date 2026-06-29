/**
 * ENERGY FLOW & SMART GRID THEME - SHARED BEHAVIORS
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise LocalStorage mock accounts if empty
    initializeMockDatabase();

    // 2. Navigation Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }



    // 2b. Scroll Progress & Scroll to Top Button Logic
    const prog = document.getElementById('scrollProgress');
    const scrollTopBtn = document.getElementById('scrollTop');
    
    function updateScrollEffects() {
        if (prog) {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            prog.style.width = total > 0 ? (scrolled / total) * 100 + '%' : '0%';
        }
        if (scrollTopBtn) {
            if (window.scrollY > 300) scrollTopBtn.classList.add('show');
            else scrollTopBtn.classList.remove('show');
        }
    }
    
    window.addEventListener('scroll', updateScrollEffects, { passive: true });
    updateScrollEffects(); // run on load
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 2c. Button Ripple Effect
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-wave';
            
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.35);
                width: ${size}px; height: ${size}px;
                transform: scale(0) translate(-50%, -50%);
                animation: rippleAnim 0.6s ease-out forwards;
                left: ${e.clientX - rect.left}px;
                top: ${e.clientY - rect.top}px;
                pointer-events: none;
                z-index: 10;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    if (!document.getElementById('rippleStyle')) {
        const s = document.createElement('style');
        s.id = 'rippleStyle';
        s.textContent = `@keyframes rippleAnim { to { transform: scale(1) translate(-50%, -50%); opacity: 0; } }`;
        document.head.appendChild(s);
    }

    // 2d. Active Navigation Link State
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2e. Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const hrefAttr = this.getAttribute('href');
            if (hrefAttr === '#' || hrefAttr.startsWith('#mobile') || hrefAttr.startsWith('#header')) return;
            const target = document.querySelector(hrefAttr);
            if (target) {
                e.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // 3. Mobile Hamburger Menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (hamburgerBtn && mobileMenu && mobileOverlay) {
        const toggleMenu = () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            // Prevent body scroll when menu is active
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
        };

        hamburgerBtn.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);

        // Close menu when clicking on nav links
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // 4. Session & Role-Based Access Controls (Dashboard Guards)
    checkDashboardSession();

    // 5. Logout Handling
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    });

    // 6. Handle Redirects for Non-Functional/Dead Buttons
    const deadLinks = document.querySelectorAll('a[href="#"], .btn-dead, a[href=""]');
    deadLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '404.html';
        });
    });

    // 7. Scroll Triggered Micro-Animations (Intersection Observer)
    const animElements = document.querySelectorAll('.animate-on-scroll');
    if (animElements.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.15,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // Trigger once
                }
            });
        }, observerOptions);

        animElements.forEach(el => observer.observe(el));
    }
});

/**
 * Pre-populates LocalStorage with template users if empty.
 */
function initializeMockDatabase() {
    let users = localStorage.getItem('users');
    if (!users) {
        const defaultUsers = [
            {
                name: 'System Operator',
                email: 'admin@gmail.com',
                phone: '1234567890',
                password: 'admin123',
                role: 'admin',
                joined: '2026-01-15'
            },
            {
                name: 'Alex Mercer',
                email: 'user@gmail.com',
                phone: '9876543210',
                password: 'user123',
                role: 'user',
                joined: '2026-03-22',
                vehicles: [
                    { id: '1', make: 'Model Grid-X', status: 'Charging', charge: 78 },
                    { id: '2', make: 'Smart Cruiser S', status: 'Discharging', charge: 42 }
                ]
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

/**
 * Validates active session access rights for admin/user dashboard areas.
 */
function checkDashboardSession() {
    const path = window.location.pathname;
    const currentUserJson = sessionStorage.getItem('currentUser');
    
    // Check if on a dashboard page
    const isAdminDashboard = path.includes('admin.html');
    const isUserDashboard = path.includes('user.html');
    
    if (isAdminDashboard || isUserDashboard) {
        if (!currentUserJson) {
            // Not logged in
            window.location.href = 'login.html';
            return;
        }
        
        const currentUser = JSON.parse(currentUserJson);
        
        // Check role permissions
        if (isAdminDashboard && currentUser.role !== 'admin') {
            window.location.href = 'user.html';
            return;
        }
        
        if (isUserDashboard && currentUser.role !== 'user') {
            window.location.href = 'admin.html';
            return;
        }
        
        // Display email and names on the dashboard panels
        const emailDisplays = document.querySelectorAll('.display-email');
        emailDisplays.forEach(el => {
            el.textContent = currentUser.email;
        });

        const nameDisplays = document.querySelectorAll('.display-name');
        nameDisplays.forEach(el => {
            el.textContent = currentUser.name;
        });
    }
}
