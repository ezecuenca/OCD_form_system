document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.querySelector('.header__user');
    
    if (userIcon) {
        userIcon.addEventListener('click', function() {
            console.log('User icon clicked');
        });
    }
});

