
import router from './routers';

function updateActiveLink() {
    const sidebarLinks = document.querySelectorAll('.sidebar__link');
    const currentPath = window.location.pathname;

    sidebarLinks.forEach(link => {
        link.classList.remove('sidebar__link--active');
    });

    sidebarLinks.forEach(link => {
        const route = link.getAttribute('data-route') || link.getAttribute('href');
        if (route) {
            const normalizedRoute = route.replace(/^\//, '');
            const normalizedPath = currentPath.replace(/^\//, '');
            
            if (normalizedPath === normalizedRoute || 
                (normalizedPath === '' && normalizedRoute === 'dashboard') ||
                (normalizedPath === '' && normalizedRoute === '/')) {
                link.classList.add('sidebar__link--active');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateActiveLink();

    const originalNavigate = router.navigate;
    router.navigate = function(path) {
        originalNavigate.call(this, path);
        setTimeout(updateActiveLink, 0);
    };

    const sidebarLinks = document.querySelectorAll('.sidebar__link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hasAttribute('data-route')) {
                setTimeout(updateActiveLink, 100);
            } else {
                sidebarLinks.forEach(l => l.classList.remove('sidebar__link--active'));
                
                this.classList.add('sidebar__link--active');
            }
        });
    });

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('sidebar--open');
        });
    }
});

export { updateActiveLink };
