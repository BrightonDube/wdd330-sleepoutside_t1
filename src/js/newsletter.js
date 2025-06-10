document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('emailInput').value.trim();
            if (email) {
                console.log('Newsletter sign-up:', email);
                alert(`Thank you for signing up with ${email}!`);
                form.reset();
            } else {
                alert('Please enter a valid email address.');
            }
        });
    } else {
        console.error('Newsletter form not found');
    }
});