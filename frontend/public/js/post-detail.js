const token = requireAuth();

// GET THE POST ID FROM THE URL
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

if (!postId) {
    window.location.href = 'dashboard.html';
}

// HELPER — SHOW/HIDE ELEMENTS
function show(id) {
    document.getElementById(id).classList.remove('hidden');
}
function hide(id) {
    document.getElementById(id).classList.add('hidden');
}

// LOAD THE POST
async function loadPost() {
    try {
        const [postRes, userRes] = await Promise.all([
            fetch(`http://localhost:5000/api/posts/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const post = await postRes.json();
        const currentUser = await userRes.json();

        if (!postRes.ok) {
            document.getElementById('loadingState').innerHTML =
                '<p class="text-muted">Project not found.</p>';
            return;
        }

        renderPost(post, currentUser);

    } catch (error) {
    }
}

// RENDER THE POST
function renderPost(post, currentUser) {
    // Hide loading, show the post card
    hide('loadingState');
    show('postCard');

    // Populate the basic post info
    document.getElementById('postCategory').textContent = post.category || 'General';
    document.getElementById('postDate').textContent =
        'Posted ' + new Date(post.created_at).toLocaleDateString();
    document.getElementById('postTitle').textContent = post.title;
    document.getElementById('postDescription').textContent = post.description;
    document.getElementById('postCreator').textContent = post.creator_name || 'Unknown';
    document.getElementById('postDepartment').textContent = post.creator_department || '';

    // Show "Closed" badge if post is not open
    if (post.status !== 'open') {
        show('postStatusBadge');
    }

    // PROJECT TYPE AND DEADLINE
    // These are optional fields — not every post will have them.
    // So we check if they exist before trying to display them.
    // If neither exists, the postMeta div stays empty and takes no space.
    const metaContainer = document.getElementById('postMeta');
    if (metaContainer) {
        const metaItems = [];

        if (post.project_type) {
            metaItems.push(`
                <div class="flex items-center gap-3 bg-cream/40 rounded-2xl p-3 border border-edge">
                    <i class="fa-solid fa-tag text-muted text-sm"></i>
                    <div>
                        <p class="text-xs text-muted">Project type</p>
                        <p class="text-sm font-semibold">${post.project_type}</p>
                    </div>
                </div>
            `);
        }

        if (post.deadline) {
            // post.deadline comes from PostgreSQL as "2026-09-01"
            // new Date() converts that string into a JS Date object
            // so we can call toLocaleDateString() to format it nicely
            metaItems.push(`
                <div class="flex items-center gap-3 bg-cream/40 rounded-2xl p-3 border border-edge">
                    <i class="fa-solid fa-calendar text-muted text-sm"></i>
                    <div>
                        <p class="text-xs text-muted">Deadline</p>
                        <p class="text-sm font-semibold">${new Date(post.deadline).toLocaleDateString()}</p>
                    </div>
                </div>
            `);
        }

        metaContainer.innerHTML = metaItems.join('');
    }

    // Render skills as pills
    // We split the comma-separated string back into an array,
    // filter out empty strings, then map each skill to a pill span.
    const skillsContainer = document.getElementById('postSkills');
    const skills = (post.required_skills || '').split(',').filter(s => s.trim());

    if (skills.length > 0) {
        skillsContainer.innerHTML = skills.map(s =>
            `<span class="text-sm px-3 py-1.5 rounded-full bg-cream border border-edge font-medium">
                ${s.trim()}
            </span>`
        ).join('');
    } else {
        skillsContainer.innerHTML = '<p class="text-sm text-muted">No specific skills listed.</p>';
    }

    // OWNER vs NON-OWNER
    const isOwner = currentUser.id === post.user_id;

    if (isOwner) {
        show('ownerSection');
        loadApplications(post);
        wireOwnerButtons(post);
    } else {
        // Only show apply section if post is still open
        if (post.status === 'open') {
            show('applySection');
            checkExistingApplication();
            wireApplyButton(post);
        }
    }

    // SMART BACK LINK
    // Check where the user came from and update the back link accordingly
    const backLink = document.getElementById('backLink');
    if (backLink) {
        const referrer = document.referrer;
        if (referrer.includes('applications.html')) {
            backLink.href = 'applications.html';
            backLink.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to applications';
        } else if (referrer.includes('my-posts.html')) {
            backLink.href = 'my-posts.html';
            backLink.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to my projects';
        } else {
            backLink.href = 'browse.html';
            backLink.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to projects';
        }
    }

}

// LOAD APPLICATIONS (owner only)
async function loadApplications(post) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/applications/${postId}/applications`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const data = await response.json();
        const apps = data.applications || data;

        document.getElementById('appCount').textContent = `(${apps.length})`;

        const list = document.getElementById('applicationsList');

        if (apps.length === 0) {
            list.innerHTML = '<p class="text-muted text-sm">No applications yet.</p>';
            return;
        }

        list.innerHTML = apps.map(app => `
            <div class="border-2 border-edge rounded-2xl p-5 mb-4" id="app-${app.id}">
                <div class="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div>
                        <p class="font-semibold">${app.full_name || 'Unknown'}</p>
                        <p class="text-xs text-muted">
                            ${app.department || '—'} · 
                            ${new Date(app.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    ${statusBadge(app.status)}
                </div>
                ${app.message
                    ? `<p class="text-sm text-muted mb-3">${app.message}</p>`
                    : ''}
                ${app.status === 'pending' ? `
                    <div class="flex gap-2 mt-3">
                        <button onclick="acceptApp(${app.id})"
                            class="px-4 py-1.5 text-sm rounded-full bg-sage text-white font-semibold hover:opacity-90 transition">
                            Accept
                        </button>
                        <button onclick="rejectApp(${app.id})"
                            class="px-4 py-1.5 text-sm rounded-full border-2 border-edge font-semibold hover:bg-cream transition">
                            Reject
                        </button>
                    </div>
                ` : ''}
                ${app.status === 'accepted' ? `
                    <div class="mt-3 p-3 bg-sage/10 border border-edge rounded-2xl text-sm">
                        <p class="font-semibold text-sage mb-1">Contact details revealed:</p>
                        <p>${app.contact_info || 'No contact info provided'}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
    }
}

// STATUS BADGE HELPER
function statusBadge(status) {
    const styles = {
        pending: 'bg-amber/20 text-amber border-amber/40',
        accepted: 'bg-sage/20 text-sage border-sage/40',
        rejected: 'bg-coral/10 text-coral border-coral/30'
    };
    return `<span class="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[status] || ''}">
        ${status}
    </span>`;
}

// ============================================================
// ACCEPT / REJECT APPLICATIONS
// These are called by the onclick on the accept/reject buttons.
// They PATCH the application status on the backend,
// then reload the applications list to reflect the change.
// ============================================================
async function acceptApp(appId) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/applications/${appId}/accept`,
            { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.ok) loadApplications();
    } catch (error) {
    }
}

async function rejectApp(appId) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/applications/${appId}/reject`,
            { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.ok) loadApplications();
    } catch (error) {
    }
}

// OWNER BUTTONS — Close project and Delete
function wireOwnerButtons(post) {
    document.getElementById('closePostBtn').addEventListener('click', async () => {
        if (!confirm('Close this project? No more applications will be accepted.')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'closed' })
            });
            if (response.ok) window.location.reload();
        } catch (error) {
        }
    });

    document.getElementById('deletePostBtn').addEventListener('click', async () => {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) window.location.href = 'dashboard.html';
        } catch (error) {
        }
    });
}

// CHECK EXISTING APPLICATION
async function checkExistingApplication() {
    try {
        const response = await fetch(
            `http://localhost:5000/api/applications/${postId}/my-application`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.application) {
                // Already applied — show status, hide form
                hide('applyForm');
                show('alreadyApplied');
                document.getElementById('applicationStatus').textContent = data.application.status;
            }
        }
    } catch (error) {
    }
}


// APPLY BUTTON
function wireApplyButton() {
    document.getElementById('applyBtn').addEventListener('click', async () => {
        const message = document.getElementById('applyMessage').value.trim();

        const btn = document.getElementById('applyBtn');
        btn.textContent = 'Sending...';
        btn.disabled = true;

        try {
            const response = await fetch(
                `http://localhost:5000/api/applications/${postId}/apply`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ message })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Failed to apply');
                btn.textContent = 'Send application';
                btn.disabled = false;
                return;
            }

            // Hide the form, show already-applied state
            hide('applyForm');
            show('alreadyApplied');
            document.getElementById('applicationStatus').textContent = 'pending';

        } catch (error) {
            btn.textContent = 'Send application';
            btn.disabled = false;
        }
    });
}

// Kick everything off
loadPost();