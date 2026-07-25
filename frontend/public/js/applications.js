const token = requireAuth();

// ============================================================
// LOAD MY APPLICATIONS
// Fetches all applications the logged-in user has submitted.
// Unlike the owner's view (which fetches apps per post),
// this fetches apps per user — everything this person applied to.
// We need a new backend route for this.
// ============================================================
async function loadMyApplications() {
    try {
        const response = await fetch('http://localhost:5000/api/applications/my-applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return;
        }

        const apps = data.applications || data;

        document.getElementById('loadingState').classList.add('hidden');

        if (apps.length === 0) {
            document.getElementById('emptyState').classList.remove('hidden');
            return;
        }

        renderApplications(apps);

    } catch (error) {
        showError('Error loading applications:', error);
    }
}

// ============================================================
// RENDER APPLICATIONS
// Each card shows the post title, category, when you applied,
// and your application status as a colored badge.
// Clicking the card takes you to the post detail page.
// The status badge color matches your design system:
// pending = amber, accepted = sage, rejected = coral
// ============================================================
function renderApplications(apps) {
    const list = document.getElementById('applicationsList');

    list.innerHTML = apps.map(app => {
        const statusStyles = {
            pending: 'bg-amber/20 text-amber border-amber/40',
            accepted: 'bg-sage/20 text-sage border-sage/40',
            rejected: 'bg-coral/10 text-coral border-coral/30'
        };

        return `
            <a href="post-detail.html?id=${app.post_id}"
               class="block bg-white rounded-3xl p-5 border-2 border-edge hover:border-coral hover:shadow-lg transition-all">
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="min-w-0">
                        <p class="text-xs uppercase tracking-wider text-sage font-semibold mb-1">
                            ${app.post_category || 'General'}
                        </p>
                        <h3 class="font-serif text-xl font-bold">${app.post_title || 'Unknown project'}</h3>
                        <p class="text-xs text-muted mt-1">
                            Applied ${new Date(app.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <span class="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${statusStyles[app.status] || ''}">
                        ${app.status}
                    </span>
                </div>
                ${app.message ? `
                    <p class="text-sm text-muted mt-3 pt-3 border-t border-edge">${app.message}</p>
                ` : ''}
            </a>
        `;
    }).join('');
}

loadMyApplications();