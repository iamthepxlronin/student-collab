const token = requireAuth();

// Fetch current user's data once on page load, so we can validate contact info before posting
let currentUser = null;

async function loadCurrentUser() {
    try {
        const response = await fetch('https://student-collab-production.up.railway.app/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        currentUser = await response.json();
    } catch (error) {
    }
}
loadCurrentUser();

// Skills tag system
const skills = [];

document.getElementById('skills').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = e.target.value.trim();
        if (!value || skills.includes(value)) return;
        skills.push(value);
        renderSkills();
        e.target.value = '';
    }
});

function renderSkills() {
    let container = document.getElementById('skillTags');
    if (!container) return;
    container.innerHTML = skills.map(s => `
        <span class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-cream border border-edge font-medium">
            ${s}
            <button type="button" onclick="removeSkill('${s}')" class="text-muted hover:text-coral">✕</button>
        </span>
    `).join('');
}

function removeSkill(skill) {
    const index = skills.indexOf(skill);
    if (index > -1) skills.splice(index, 1);
    renderSkills();
}

// Form submission
document.getElementById('createPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Block posting if the user hasn't set their contact info
    if (!currentUser || !currentUser.contact_info || !currentUser.contact_info.trim()) {
        alert('Please add your WhatsApp number in your profile before posting, so applicants can reach you.');
        window.location.href = 'profile.html';
        return;
    }

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const slots_needed = 1;

    if (!title) return alert('Project title is required');
    if (!description) return alert('Description is required');
    if (!category) return alert('Please select a category');

    try {
        const response = await fetch('https://student-collab-production.up.railway.app/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
           body: JSON.stringify({
                title,
                description,
                category,
                required_skills: skills.join(', '),
                slots_needed,
                project_type: document.getElementById('projectType').value || undefined,
                deadline: document.getElementById('deadline').value || undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to create post');
            return;
        }

        window.location.href = 'dashboard.html';

    } catch (error) {
        alert('Could not connect to server. Is your backend running?');
    }
});