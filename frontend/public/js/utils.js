// AUTH GUARD
function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html?mode=login';
    }
    return token;
}

//LOGOUT
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'auth.html?mode=login';
}
// SIDEBAR
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const currentPage = window.location.pathname.split('/').pop();

    const links = [
        { href: 'dashboard.html', label: 'Browse Projects', icon: 'fa-compass' },
        { href: 'create-post.html', label: 'New Project', icon: 'fa-plus' },
        { href: 'my-posts.html', label: 'My Projects', icon: 'fa-folder' },
        { href: 'applications.html', label: 'My Applications', icon: 'fa-paper-plane' },
        { href: 'profile.html', label: 'My Profile', icon: 'fa-user' },
    ];

    sidebar.innerHTML = `
        <div class="flex flex-col h-full p-6">
            <div class="flex items-center justify-between mb-10">
                <a href="dashboard.html" class="font-serif text-xl font-black">
                    Collab<span class="text-coral">Space</span>
                </a>
                <!-- Close button inside sidebar -->
                <button id="sidebarClose" class="text-muted hover:text-coral transition">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <nav class="flex flex-col gap-1 flex-1">
                ${links.map(link => `
                    <a href="${link.href}"
                       class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition
                       ${currentPage === link.href
                           ? 'bg-coral text-white'
                           : 'text-muted hover:bg-cream hover:text-ink'}">
                        <i class="fa-solid ${link.icon} w-4"></i>
                        ${link.label}
                    </a>
                `).join('')}
            </nav>
            <button onclick="logout()"
                    class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-muted hover:bg-cream hover:text-coral transition">
                <i class="fa-solid fa-arrow-right-from-bracket w-4"></i>
                Logout
            </button>
        </div>
    `;

    // Wire up toggle logic
    // The toggle button is in the navbar, the close button is inside the sidebar
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');

    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-50');
    }

    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-50');
    }

    if (toggle) toggle.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
}

renderSidebar();