document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePass = document.getElementById('togglePass');
    const errorMsg = document.getElementById('errorMsg');

    // Toggle password visibility
    togglePass.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePass.textContent = type === 'password' ? 'SHOW' : 'HIDE';
    });

    // Handle Login with Supabase
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!window.supabase) {
            errorMsg.textContent = "Database connection error.";
            errorMsg.style.display = 'block';
            return;
        }

        // Map short username to email format for Supabase backwards compatibility for testing
        const email = username.includes('@') ? username : `${username}@vinato.com`;

        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            
            // Shake effect for login card
            const card = document.querySelector('.login-card');
            card.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => card.style.animation = '', 500);
        } else {
            // Save token to satisfy existing session checks
            localStorage.setItem('admin_session', data.session.access_token);
            window.location.href = 'index.html';
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
