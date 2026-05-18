// ========== ТЕМНА ТЕМА ==========
const THEME_KEY = 'theme';

export function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
}

export function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    updateThemeButton();
}

export function updateThemeButton() {
    const btn = document.querySelector('.theme-btn');
    if (btn) {
        const isDark = document.body.classList.contains('dark');
        btn.textContent = isDark ? '☀️' : '🌙';
    }
}
