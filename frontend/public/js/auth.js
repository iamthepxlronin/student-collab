console.log('auth.js loaded');
// CONFIGURATION
const API_BASE = 'http://localhost:5000/api';

// TAB SWITCHING
const params = new URLSearchParams(window.location.search);
const mode = params.get('mode') || 'login'; // default to login

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const authFooter = document.getElementById('authFooter');

function showLogin() {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');

    // Active tab styling
    loginTab.classList.add('bg-white', 'shadow-sm', 'text-ink');
    loginTab.classList.remove('text-muted');
    signupTab.classList.remove('bg-white', 'shadow-sm', 'text-ink');
    signupTab.classList.add('text-muted');

    pageTitle.innerHTML = 'Welcome <em class="italic text-coral">back</em>';
    pageSubtitle.textContent = 'Sign in to continue to your dashboard';
    authFooter.innerHTML = `Don't have an account? <a href="?mode=signup" class="text-coral hover:underline font-semibold">Create account</a>`;
}

function showSignup() {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');

    // Active tab styling
    signupTab.classList.add('bg-white', 'shadow-sm', 'text-ink');
    signupTab.classList.remove('text-muted');
    loginTab.classList.remove('bg-white', 'shadow-sm', 'text-ink');
    loginTab.classList.add('text-muted');

    pageTitle.innerHTML = 'Create your <em class="italic text-coral">account</em>';
    pageSubtitle.textContent = 'Join StuCollab and find your team';
    authFooter.innerHTML = `Already have an account? <a href="?mode=login" class="text-coral hover:underline font-semibold">Sign in</a>`;
}


// Run on page load
if (mode === 'signup') {
    showSignup();
} else {
    showLogin();
}

// PASSWORD TOGGLE
document.querySelectorAll('button[type="button"]').forEach(button => {
    button.addEventListener('click', () => {
        // The input is the previous sibling element of the button's parent
        const input = button.closest('div').querySelector('input');
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
});

// ERROR DISPLAY HELPER
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.remove('hidden');
}

function clearErrors() {
    document.querySelectorAll('p[id$="Error"]').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

// SIGNUP
signupForm.addEventListener('submit', async (e) => {
    // Prevent the browser's default form submission (which reloads the page)
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const department = document.getElementById('signupDepartment').value;
    const skills = document.getElementById('signupSkills').value.trim();

    // Basic front-end validation before even hitting the network
    if (!name) return showError('signupNameError', 'Full name is required');
    if (!email) return showError('signupEmailError', 'Email is required');
    if (!password || password.length < 6) return showError('signupPasswordError', 'Password must be at least 6 characters');
    if (!department) return showError('signupDepartmentError', 'Please select your department');

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: name, email, password, department, skills })
        });

        // response.json() reads the response body and parses it from JSON
        const data = await response.json();

        if (!response.ok) {
            // response.ok is true for 200-299 status codes
            // Your backend sends error messages — we display them
            showError('signupEmailError', data.message || 'Signup failed. Try again.');
            return;
        }

        // Save token to localStorage — this is how the user stays "logged in"
        localStorage.setItem('token', data.token);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        // This catches network errors (e.g. backend not running)
        console.log('Fetch error:', error);
        showError('signupEmailError', 'Could not connect to server. Is your backend running?');
    }
});

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email) return showError('loginEmailError', 'Email is required');
    if (!password) return showError('loginPasswordError', 'Password is required');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('loginPasswordError', data.message || 'Login failed. Check your credentials.');
            return;
        }

        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';

    } catch (error) {
        showError('loginEmailError', 'Could not connect to server. Is your backend running?');
    }
});
