const token = requireAuth();

// ============================================================
// LOAD MY POSTS
// Fetches only the posts created by the logged-in user.
// The backend filters by user_id using the JWT token,
// so we don't need to pass the user id explicitly —
// the backend reads it from req.user.id.
// It also returns applicant_count for each post so we can
// show how many people have applied.
// ============================================================
async function loadMyPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/posts/my-posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            console.log('Error loading posts:', data.message);
            return;
        }

        const posts = data.posts || data;

        // Hide loading state
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('postCount').textContent = posts.length;

        if (posts.length === 0) {
            document.getElementById('emptyState').classList.remove('hidden');
            return;
        }

        renderMyPosts(posts);

    } catch (error) {
        console.log('Error loading my posts:', error);
    }
}

// ============================================================
// RENDER MY POSTS
// Each card shows the post title, category, status badge,
// description, applicant count, and a link to the post detail.
// The status badge is green for open, grey for closed —
// giving the owner a quick visual on each post's state.
// ============================================================
function renderMyPosts(posts) {
    const grid = document.getElementById('myPostsGrid');

    grid.innerHTML = posts.map(post => `
        <a href="post-detail.html?id=${post.id}"
           class="bg-white rounded-3xl p-6 border-2 border-edge hover:border-coral hover:shadow-lg transition-all flex flex-col">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold uppercase tracking-wider text-sage">
                    ${post.category || 'General'}
                </span>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold
                    ${post.status === 'open'
                        ? 'bg-sage/10 text-sage'
                        : 'bg-cream text-muted'}">
                    ${post.status}
                </span>
            </div>
            <h3 class="font-serif text-xl font-bold mb-2 leading-snug">${post.title}</h3>
            <p class="text-sm text-muted line-clamp-2 mb-4 flex-1">${post.description}</p>
            <div class="pt-4 border-t border-edge flex items-center justify-between text-xs text-muted">
                <span>${new Date(post.created_at).toLocaleDateString()}</span>
                <span class="font-semibold text-ink">
                    <i class="fa-solid fa-users mr-1"></i>
                    ${post.applicant_count || 0} applicant${post.applicant_count == 1 ? '' : 's'}
                </span>
            </div>
        </a>
    `).join('');
}

loadMyPosts();