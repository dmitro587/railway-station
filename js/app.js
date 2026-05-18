// ========== ГОЛОВНИЙ МОДУЛЬ ==========
import { initTheme, toggleTheme, updateThemeButton } from './ui/theme.js';
import { getRoutes, getFavorites, addPriceAlert, addSearchHistory } from './services/storage.js';
import { isLoggedIn, getCurrentUser, logoutUser, requireAuth } from './services/auth.js';
import { renderCards } from './ui/cards.js';

// Глобальні змінні
let allRoutes = [];

// ========== ІНІЦІАЛІЗАЦІЯ ==========
function init() {
    // Ініціалізація теми
    initTheme();
    updateThemeButton();
    
    // Додаємо обробник для кнопки теми
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    
    // Завантажуємо маршрути
    allRoutes = getRoutes();
    
    // Показуємо популярні маршрути
    const container = document.querySelector('[data-popular-routes]');
    if (container) {
        const popular = allRoutes.slice(0, 6);
        renderCards(container, popular, true);
    }
    
    // Показуємо статус користувача
    updateUserStatus();
    
    // Додаємо обробники подій
    setupEventDelegation();
}

function updateUserStatus() {
    const statusContainer = document.querySelector('[data-user-status]');
    if (!statusContainer) return;
    
    const user = getCurrentUser();
    if (user) {
        statusContainer.innerHTML = `
            ✅ Ви увійшли як <strong>${escapeHtml(user.name)}</strong>
            <a href="profile.html">👤 Кабінет</a>
            <button data-action="logout">🚪 Вийти</button>
        `;
    } else {
        statusContainer.innerHTML = `
            🔒 Ви не увійшли
            <a href="login.html">🔐 Увійти</a>
            <a href="register.html">📝 Реєстрація</a>
        `;
    }
}

function setupEventDelegation() {
    document.addEventListener('click', (event) => {
        // Вихід
        if (event.target.dataset.action === 'logout') {
            event.preventDefault();
            logoutUser();
            window.location.reload();
        }
        
        // Покупка квитка
        if (event.target.dataset.action === 'buy') {
            const routeId = parseInt(event.target.dataset.id);
            buyTicket(routeId);
        }
        
        // Вибране
        if (event.target.dataset.action === 'favorite') {
            const routeId = parseInt(event.target.dataset.id);
            toggleFavorite(routeId);
        }
        
        // Підписка на знижки
        if (event.target.dataset.action === 'notify') {
            const routeId = parseInt(event.target.dataset.id);
            addPriceAlert(routeId);
            alert('✅ Підписка оформлена!');
        }
    });
}

function buyTicket(routeId) {
    if (!requireAuth()) return;
    
    const route = allRoutes.find(r => r.id === routeId);
    if (!route) return;
    
    Swal.fire({
        title: `🎫 Квиток ${route.from} → ${route.to}`,
        text: `Ціна: ${route.price} грн\nДата: ${new Date().toLocaleDateString()}`,
        confirmButtonText: 'Купити'
    }).then(result => {
        if (result.isConfirmed) {
            alert(`✅ Квиток куплено!\n${route.from} → ${route.to}\nСума: ${route.price} грн`);
        }
    });
}

function toggleFavorite(routeId) {
    const fav = getFavorites();
    if (fav.includes(routeId)) {
        alert('⭐ Видалено з вибраного');
    } else {
        alert('⭐ Додано до вибраного');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Запускаємо після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
