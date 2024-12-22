document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    const teamMembers = document.querySelectorAll('.team-member');

    function updateBackgroundColor() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = scrollPosition / (documentHeight - windowHeight);

        if (scrollPercentage < 0.3) {
            hero.style.backgroundColor = `rgb(243, 244, 246)`;
        } else if (scrollPercentage < 0.6) {
            const r = Math.floor(243 - scrollPercentage * 453);
            const g = Math.floor(244 - scrollPercentage * 433);
            const b = Math.floor(246 - scrollPercentage * 413);
            hero.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        } else {
            hero.style.backgroundColor = `rgb(0, 0, 0)`;
        }
    }

    function animateTeamMembers() {
        teamMembers.forEach((member, index) => {
            const delay = index * 100;
            setTimeout(() => {
                member.style.opacity = '1';
                member.style.transform = 'translateY(0)';
            }, delay);
        });
    }

    window.addEventListener('scroll', updateBackgroundColor);
    updateBackgroundColor();

    animateTeamMembers();
});

