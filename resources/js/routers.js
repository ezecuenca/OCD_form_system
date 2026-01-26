class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.contentContainer = null;
    }

    init() {
        this.contentContainer = document.getElementById('app-content') || document.querySelector('.main-content');
        
        if (!this.contentContainer) {
            console.error('Content container not found');
            return;
        }

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        window.addEventListener('popstate', (e) => {
            const path = window.location.pathname;
            this.handleRoute(path);
        });

        this.handleRoute(window.location.pathname);
    }

    route(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute(path);
    }

    handleRoute(path) {
        const normalizedPath = path === '/' ? '/dashboard' : path;
        
        let matchedRoute = null;
        let matchedHandler = null;

        if (this.routes[normalizedPath]) {
            matchedRoute = normalizedPath;
            matchedHandler = this.routes[normalizedPath];
        } else {
            for (const routePath in this.routes) {
                const pattern = routePath.replace(/:\w+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                if (regex.test(normalizedPath)) {
                    matchedRoute = routePath;
                    matchedHandler = this.routes[routePath];
                    break;
                }
            }
        }

        if (matchedHandler) {
            this.currentRoute = matchedRoute;
            matchedHandler(this.contentContainer);
        } else {
            if (this.routes['/dashboard']) {
                this.navigate('/dashboard');
            } else {
                console.warn(`Route not found: ${normalizedPath}`);
            }
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

const router = new Router();

export default router;
