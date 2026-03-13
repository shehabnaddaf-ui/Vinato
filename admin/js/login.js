document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePass = document.getElementById('togglePass');
    const errorMsg = document.getElementById('errorMsg');

    // Default credentials
    const DEFAULT_USER = "vinato";
    const DEFAULT_PASS = "Vinato@321#";

    // Toggle password visibility
    togglePass.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePass.textContent = type === 'password' ? 'SHOW' : 'HIDE';
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Check local storage for custom credentials, fallback to default
        const storedUser = localStorage.getItem('admin_user') || DEFAULT_USER;
        const storedPass = localStorage.getItem('admin_pass') || DEFAULT_PASS;

        if (username === storedUser && password === storedPass) {
            // Create a fake session token
            const token = btoa(username + Date.now());
            localStorage.setItem('admin_session', token);
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            
            // Shake effect for login card
            const card = document.querySelector('.login-card');
            card.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => card.style.animation = '', 500);
        }
    });
});

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
    }
`;
document.head.appendChild(style);
