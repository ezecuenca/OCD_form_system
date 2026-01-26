import './bootstrap';

import router from './routers';

import './dashboard';
import './adr-reports';
import './adr-form';
import './archived-reports';
import './settings';
import './sidebar';
import './header';

document.addEventListener('DOMContentLoaded', function() {
    router.init();
});
