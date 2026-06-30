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