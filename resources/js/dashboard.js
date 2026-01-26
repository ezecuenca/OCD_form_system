import router from './routers';

class Dashboard {
    constructor() {
        this.container = null;
    }

    init(container) {
        this.container = container;
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="dashboard">
                <div class="dashboard__header">
                    <h1 class="dashboard__title">Dashboard</h1>
                    <p class="dashboard__subtitle">After Duty Report System</p>
                </div>
                
                <div class="dashboard__content">
                    <div class="dashboard__cards">
                        <div class="dashboard__card">
                            <div class="dashboard__card-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="dashboard__card-content">
                                <h3 class="dashboard__card-title">ADR Reports</h3>
                                <p class="dashboard__card-description">View and manage After Duty Reports</p>
                            </div>
                        </div>

                        <div class="dashboard__card">
                            <div class="dashboard__card-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 9V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M7 5L12 2L17 5V9H7V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="dashboard__card-content">
                                <h3 class="dashboard__card-title">Archived Reports</h3>
                                <p class="dashboard__card-description">Access archived duty reports</p>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard__section">
                        <h2 class="dashboard__section-title">Recent Activity</h2>
                        <div class="dashboard__activity">
                            <p>No recent activity to display.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const cards = this.container.querySelectorAll('.dashboard__card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('Card clicked');
            });
        });
    }

    async loadData() {
        try {
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboard(data) {
        console.log('Updating dashboard with data:', data);
    }
}

function renderDashboard(container) {
    const dashboard = new Dashboard();
    dashboard.init(container);
}

import { renderADRReports } from './adr-reports';
router.route('/dashboard', renderADRReports);
router.route('/', renderADRReports);

export { Dashboard, renderDashboard };
