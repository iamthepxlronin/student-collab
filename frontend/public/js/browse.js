const token = requireAuth();
let allPosts = [];

async function loadUser() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) { logout(); return; }
        const welcomeEl = document.getElementById('welcomeName');
        if (welcomeEl) welcomeEl.textContent = data.name || data.full_name;
    } catch (error) {
        showError('Error loading user:');
    }
}

async function loadPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {  return; }

        const posts = data.posts || data;
        allPosts = posts;
        applyFilters();
    } catch (error) {
    }
}

function renderPosts(posts) {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;

    if (posts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-3 text-center bg-white border-2 border-dashed border-edge rounded-3xl py-16 px-6">
                <p class="text-muted mb-4">No projects match your search.</p>
                <a href="create-post.html" class="inline-flex font-semibold text-white bg-coral px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition">
                    Be the first to post →
                </a>
            </div>`;
        return;
    }

    grid.innerHTML = posts.map(item => `
        <a href="post-detail.html?id=${item.id}"
        class="group bg-white rounded-3xl p-8 border-2 mb-4 border-edge hover:border-coral hover:shadow-xl transition-all flex flex-col">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold uppercase tracking-wider text-sage">${item.category || 'General'}</span>
                <span class="text-xs text-muted">${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <h3 class="font-serif capitalize text-xl font-bold mb-2 leading-snug group-hover:text-coral transition">${item.title}</h3>
            <p class="text-sm text-muted line-clamp-3 mb-4">${item.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${(item.required_skills || '').split(',').filter(s => s.trim()).slice(0, 4).map(s =>
                    `<span class="text-xs px-4 py-1.5 rounded-full bg-cream border border-edge font-medium">${s.trim()}</span>`
                ).join('')}
            </div>
            <div class="mt-auto py-3 border-t border-edge text-xs text-muted">
                by <span class="font-semibold text-ink">${item.creator_name || 'Unknown'}</span>
                ${item.creator_department ? `· ${item.creator_department}` : ''}
            </div>
        </a>
    `).join('');
}

function updateCount(count) {
    const countEl = document.getElementById('projectsCount');
    const resultsEl = document.getElementById('resultsCount');
    if (countEl) countEl.textContent = count;
    if (resultsEl) resultsEl.textContent = count;
}

function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const sort = document.getElementById('sortFilter').value;
    const category = document.getElementById('categoryFilter').value;

    // Only show open posts — closed posts are not available for applications
    let filtered = allPosts.filter(post => post.status === 'open');

    // Text search
    if (query) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.description.toLowerCase().includes(query)
        );
    }

    // Category filter
    if (category !== 'all') {
        filtered = filtered.filter(post => post.category === category);
    }

    // Sort by date
    if (sort === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    renderPosts(filtered);
    updateCount(filtered.length);
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('sortFilter').addEventListener('change', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);

document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortFilter').value = 'newest';
    document.getElementById('categoryFilter').value = 'all';
    applyFilters();
});

loadUser();
loadPosts();