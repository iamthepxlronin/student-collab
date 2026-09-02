const token = requireAuth();

// ============================================================
// LOAD USER
// Fetches the logged-in user's name for the welcome message.
// ============================================================
async function loadUser() {
    try {
        const response = await fetch('https://student-collab-production.up.railway.app/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) { logout(); return; }

        const name = (data.full_name || data.name || 'there').split(' ')[0];
        document.getElementById('welcomeName').textContent = name;

    } catch (error) {
        showError('Error loading user:');
    }
}

// ============================================================
// LOAD STATS
// Fetches my posts and my applications in parallel,
// then calculates the three stat numbers from that data.
// ============================================================
async function loadStats() {
    try {
        const [postsRes, appsRes, allPostsRes] = await Promise.all([
            fetch('https://student-collab-production.up.railway.app/api/posts/my-posts', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('https://student-collab-production.up.railway.app/api/applications/my-applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('https://student-collab-production.up.railway.app/api/posts', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const posts = await postsRes.json();
        const apps = await appsRes.json();
        const allPosts = await allPostsRes.json();

        const myPosts = posts.posts || posts;
        const myApps = apps.applications || apps;
        const openPosts = (allPosts.posts || allPosts).filter(p => p.status === 'open');

        // Total posts created
        document.getElementById('statPostsCount').textContent = myPosts.length;

        // Total applications sent
        document.getElementById('statAppsCount').textContent = myApps.length;

        // Pending applications only
        const pending = myApps.filter(a => a.status === 'pending');
        document.getElementById('statPendingCount').textContent = pending.length;

        // Posts that match your skills (50%+ overlap)
        const matchingPosts = openPosts.filter(p => (p.matchPercentage || 0) >= 50);
        document.getElementById('statMatchCount').textContent = matchingPosts.length;

        // Render recent activity (last 3 of each)
        renderRecentPosts(myPosts.slice(0, 3));
        renderRecentApplications(myApps.slice(0, 3));

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============================================================
// RENDER RECENT POSTS
// Shows the 3 most recent posts the user created.
// Each card links to the post detail page.
// ============================================================
function renderRecentPosts(posts) {
    const container = document.getElementById('recentPosts');

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="bg-white border-2 border-dashed border-edge rounded-2xl p-6 text-center">
                <p class="text-muted text-sm mb-2">No projects yet.</p>
                <a href="create-post.html" class="text-coral text-sm font-semibold hover:underline">
                    Post your first project →
                </a>
            </div>`;
        return;
    }

    container.innerHTML = posts.map(post => `
        <a href="post-detail.html?id=${post.id}"
           class="block bg-white rounded-2xl border-2 border-edge hover:border-coral hover:shadow-md transition-all p-4">
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs uppercase tracking-wider font-semibold text-sage">
                    ${post.category || 'General'}
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold
                    ${post.status === 'open' ? 'bg-sage/10 text-sage' : 'bg-cream text-muted'}">
                    ${post.status}
                </span>
            </div>
            <h3 class="font-serif font-bold text-base leading-snug mb-1">${post.title}</h3>
            <p class="text-xs text-muted">
                <i class="fa-solid fa-users mr-1"></i>
                ${post.applicant_count || 0} applicant${post.applicant_count == 1 ? '' : 's'}
            </p>
        </a>
    `).join('');
}

// ============================================================
// RENDER RECENT APPLICATIONS
// Shows the 3 most recent applications the user submitted.
// Status badge color matches pending/accepted/rejected states.
// ============================================================
function renderRecentApplications(apps) {
    const container = document.getElementById('recentApplications');

    if (apps.length === 0) {
        container.innerHTML = `
            <div class="bg-white border-2 border-dashed border-edge rounded-2xl p-6 text-center">
                <p class="text-muted text-sm mb-2">No applications yet.</p>
                <a href="browse.html" class="text-coral text-sm font-semibold hover:underline">
                    Browse projects →
                </a>
            </div>`;
        return;
    }

    const statusStyles = {
        pending: 'bg-amber/20 text-amber border-amber/40',
        accepted: 'bg-sage/20 text-sage border-sage/40',
        rejected: 'bg-coral/10 text-coral border-coral/30'
    };

    container.innerHTML = apps.map(app => `
        <a href="post-detail.html?id=${app.post_id}"
           class="block bg-white rounded-2xl border-2 border-edge hover:border-coral hover:shadow-md transition-all p-4">
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs uppercase tracking-wider font-semibold text-sage">
                    ${app.post_category || 'General'}
                </span>
                <span class="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full border
                    ${statusStyles[app.status] || ''}">
                    ${app.status}
                </span>
            </div>
            <h3 class="font-serif font-bold text-base leading-snug mb-1">
                ${app.post_title || 'Unknown project'}
            </h3>
            <p class="text-xs text-muted">
                Applied ${new Date(app.created_at).toLocaleDateString()}
            </p>
        </a>
    `).join('');
}

loadUser();
loadStats();