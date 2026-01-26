import router from './routers';

function renderArchivedReports(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="archived-reports">
            <div class="archived-reports__header">
                <h1 class="archived-reports__title">Archived Reports</h1>
            </div>
            
            <div class="archived-reports__content">
                <p>Archived Reports content will go here.</p>
            </div>
        </div>
    `;
}

router.route('/archived-reports', renderArchivedReports);

export { renderArchivedReports };
