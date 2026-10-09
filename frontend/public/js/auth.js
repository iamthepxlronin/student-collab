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

const signupPassword = document.getElementById('signupPassword');
const meterContainer = document.getElementById('passwordMeter');
const meterFill = document.getElementById('passwordMeterBar');
const meterLabel = document.getElementById('passwordMeterLabel');


 // 2. REAL-TIME PASSWORD STRENGTH METER
function calculateStrength(pwd) {
    // Weak: would be rejected on submit (under 8, or missing a letter or number)
    if (!isValidPassword(pwd)) {
        return { label: "Weak", pct: 33, color: "#dc2626" };   // red
    }
    // Strong: valid, plus a special character or 12+ characters
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) {
        return { label: "Strong", pct: 100, color: "#16a34a" }; // green
    }
    // Okay: valid (8+ with a letter and a number)
    return { label: "Okay", pct: 66, color: "#eab308" };        // yellow
}

if (signupPassword && meterContainer) {
    signupPassword.addEventListener("input", (e) => {
        const val = e.target.value;
        if (!val) {
            meterContainer.classList.add("hidden");
            return;
        }
        meterContainer.classList.remove("hidden");
        const { label, pct, color } = calculateStrength(val);

        // Width and color are set inline so they don't depend on the Tailwind build
        meterFill.style.width = `${pct}%`;
        meterFill.style.backgroundColor = color;
        meterLabel.textContent = label;
        meterLabel.style.color = color;
    });
}

signupForm.reset();
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

function clearErrors() {
    document.querySelectorAll('p[id$="Error"]').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

// ============================================================
// SKILLS TAG SYSTEM
// We maintain a skillsArray in memory.
// On load, existing skills from the DB are parsed into it.
// On save, we join it back to a comma string.
// ============================================================
let skillsArray = [];

function renderSkillPills() {
    const container = document.getElementById('skillTags');
    if (!container) return;
    container.innerHTML = skillsArray.map(s => `
        <span class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cream border border-edge font-medium">
            ${s}
            <button type="button" onclick="removeSkill('${s}')" class="text-muted hover:text-coral">✕</button>
        </span>
    `).join('');
}

function removeSkill(skill) {
    skillsArray = skillsArray.filter(s => s !== skill);
    renderSkillPills();
}

function addSkillFromInput(inputEl) {
    const value = inputEl.value.trim();
    if (!value || skillsArray.includes(value)) return;
    skillsArray.push(value);
    renderSkillPills();
    inputEl.value = '';
}

document.getElementById('signupSkills').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addSkillFromInput(e.target);
    }
});
document.getElementById('addSkillBtn').addEventListener('click', () => {
    addSkillFromInput(document.getElementById('signupSkills'));
});

//auth hardning
function isValidSignupName(name) {
    const trimmed = name.trim();
    if (trimmed.length < 3|| trimmed.length > 80){
        return false;
    }
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const isValidCharacters = nameRegex.test(trimmed);

    if (!isValidCharacters) {
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    if (!/[a-zA-Z]/.test(password)) {
        return false
    }
    
    if(!/[0-9]/.test(password)) {
        return false
    }
    
    if (password.length < 8 || password.length > 72) {
        return false
    }
    
    return true;
}

// SIGNUP
signupForm.addEventListener('submit', async (e) => {
    // Prevent the browser's default form submission (which reloads the page)
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const department = document.getElementById('signupDepartment').value;
    const skills = document.getElementById('signupSkills').value.trim();

    // Basic front-end validation before even hitting the network
    let hasError = false;
    if (!name) {
        showError('signupNameError', 'Full name is required');
        hasError = true; 
    } else if (!isValidSignupName(name)) {
        showError('signupNameError', 'Full name is required, enter valid characters only');
        hasError = true;
    }
    
    if (!email) {
        showError('signupEmailError', 'Email is required');
        hasError = true;
    }   else if (!isValidEmail(email)) {
        showError('signupEmailError', 'Enter a valid email');
        hasError = true;
    }
    if (!isValidPassword(password)) {
        showError('signupPasswordError', 'Password must be least 8 characters and include a number');
        hasError = true;
    }
    if (confirmPassword !== password) {
        showError('confirmPasswordError','Password do not match');
        hasError = true;
    }  
    if (!department) {
        showError('signupDepartmentError', 'Please select your department');
        hasError = true;
    }

    if (hasError) return;

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