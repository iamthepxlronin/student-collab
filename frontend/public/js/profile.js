const token = requireAuth();

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

document.getElementById('skills').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = e.target.value.trim();
        if (!value || skillsArray.includes(value)) return;
        skillsArray.push(value);
        renderSkillPills();
        e.target.value = '';
    }
});

// ============================================================
// LOAD PROFILE
// Fetches current user's data and pre-fills the form.
// Skills are parsed from comma string back into pills.
// ============================================================
async function loadProfile() {
    try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return;
        }

        document.getElementById('fullName').value = data.full_name || '';
        document.getElementById('department').value = data.department || '';
        document.getElementById('level').value = data.level || '';
        document.getElementById('bio').value = data.bio || '';
        document.getElementById('contactInfo').value = data.contact_info || '';

        // Parse existing skills into pills
        if (data.skills) {
            skillsArray = data.skills.split(',').map(s => s.trim()).filter(s => s);
            renderSkillPills();
        }

    } catch (error) {
    }
}

// ============================================================
// SAVE PROFILE
// Collects form values and sends PUT request to backend.
// Skills come from skillsArray, not the input field directly.
// ============================================================
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveProfileBtn');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const full_name = document.getElementById('fullName').value.trim();
    const department = document.getElementById('department').value;
    const level = document.getElementById('level').value;
    const bio = document.getElementById('bio').value.trim();
    const contact_info = document.getElementById('contactInfo').value.trim();
    const skills = skillsArray.join(', ');

    if (!full_name) {
        alert('Full name is required');
        btn.textContent = 'Save profile';
        btn.disabled = false;
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ full_name, department, level, bio, skills, contact_info })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to save profile');
            btn.textContent = 'Save profile';
            btn.disabled = false;
            return;
        }

        // Brief green success state instead of an alert popup
        btn.textContent = 'Saved ✓';
        btn.classList.add('bg-sage');
        btn.classList.remove('bg-coral');

        setTimeout(() => {
            btn.textContent = 'Save profile';
            btn.disabled = false;
            btn.classList.remove('bg-sage');
            btn.classList.add('bg-coral');
        }, 2000);

    } catch (error) {
        alert('Could not connect to server');
        btn.textContent = 'Save profile';
        btn.disabled = false;
    }
});

loadProfile();