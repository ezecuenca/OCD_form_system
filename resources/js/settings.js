import router from './routers';

function renderSettings(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="settings">
            <div class="settings__header">
                <h1 class="settings__title">Settings</h1>
            </div>
            
            <div class="settings__content">
                <p>Settings content will go here.</p>
            </div>
        </div>
    `;
}

router.route('/settings', renderSettings);

export { renderSettings };
