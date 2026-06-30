console.log('create-post.js loaded');
const token = requireAuth();
console.log('token', token);

// Skills tag system
const skills = [];

document.getElementById('skills').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // stop form submission
        const value = e.target.value.trim();
        if (!value || skills.includes(value)) return;
        skills.push(value);
        renderSkills();
        e.target.value = '';
    }
});
console.log('skills listener attached');

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

console.log('attaching from listener')
// Form submission
document.getElementById('createPostForm').addEventListener('submit', async (e) => {
    console.log('form submitted')
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const slots_needed = 1; // default for now

    if (!title) return alert('Project title is required');
    if (!description) return alert('Description is required');
    if (!category) return alert('Please select a category');

    try {
        console.log('sending:', { title, description, category, required_skills: skills.join(', '), slots_needed });
        console.log('skills array at submit:', skills);
        const response = await fetch('http://localhost:5000/api/posts', {
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
                slots_needed
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to create post');
            return;
        }

        // Redirect to dashboard after successful post
        window.location.href = 'dashboard.html';

    } catch (error) {
        alert('Could not connect to server. Is your backend running?');
    }
});