// ========== ГОЛОВНИЙ МОДУЛЬ ==========
import { initTheme, toggleTheme, updateThemeButton } from './ui/theme.js';
import { getTicketStats } from './services/storage.js';
import { getCurrentUser, logoutUser } from './services/auth.js';
import { fetchRoutesFromSupabase } from './services/supabase-client.js';

// ========== СТАНИ ЗАВАНТАЖЕННЯ ==========
const STATES = {
    loading: `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>⏳ Завантаження маршрутів...</p>
        </div>
    `,
    empty: `
        <div class="empty-state">
            <p>📭 Наразі немає доступних маршрутів</p>
            <p>Спробуйте пізніше або змініть параметри пошуку</p>
        </div>
    `,
    error: (message) => `
        <div class="error-state">
            <p>❌ ${message || 'Помилка завантаження'}</p>
            <button class="retry-btn" onclick="location.reload()">🔄 Спробувати знову</button>
        </div>
    `
};

function showState(container, state, message = '') {
    if (!container) return;
    if (state === 'loading') {
        container.innerHTML = STATES.loading;
    } else if (state === 'empty') {
        container.innerHTML = STATES.empty;
    } else if (state === 'error') {
        container.innerHTML = STATES.error(message);
    }
}

// ========== ГОДИННИК ТА ДАТА ==========
function updateDateTime() {
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    if (dateEl) dateEl.innerText = now.toLocaleDateString('uk-UA');
    if (timeEl) timeEl.innerText = now.toLocaleTimeString('uk-UA');
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ========== БАНЕР-СЛАЙДЕР ==========
let currentSlide = 0;
let slides = [];

function initSlider() {
    slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    createDots();
    setInterval(() => { nextSlide(); }, 5000);
}

function createDots() {
    const dotsContainer = document.getElementById('dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    });
    updateDots();
}

function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function updateSlider() {
    const slider = document.getElementById('slider');
    if (slider) slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots();
}

window.nextSlide = function() { 
    currentSlide = (currentSlide + 1) % slides.length; 
    updateSlider(); 
};

window.prevSlide = function() { 
    currentSlide = (currentSlide - 1 + slides.length) % slides.length; 
    updateSlider(); 
};

window.goToSlide = function(index) { 
    currentSlide = index; 
    updateSlider(); 
};

// ========== ШВИДКИЙ ПОШУК ==========
window.quickSearch = function() {
    const from = document.getElementById('quickFrom')?.value;
    const to = document.getElementById('quickTo')?.value;
    if(from && to) {
        localStorage.setItem('search_from', from);
        localStorage.setItem('search_to', to);
        window.location.href = 'schedule.html';
    } else {
        Swal.fire('Введіть міста', 'Будь ласка, введіть "Звідки" та "Куди"', 'info');
    }
};

window.searchTag = function(from, to) {
    localStorage.setItem('search_from', from);
    localStorage.setItem('search_to', to);
    window.location.href = 'schedule.html';
};

// ========== ЛІЧИЛЬНИК ПАСАЖИРІВ ==========
function updatePassengerCounter() {
    const stats = getTicketStats();
    let count = stats.length + 10000;
    const counterEl = document.getElementById('passengerCounter');
    if (counterEl) counterEl.innerText = count.toLocaleString();
}

// ========== ВІДОБРАЖЕННЯ МАРШРУТІВ З SUPABASE ==========
async function displayRoutes() {
    const container = document.querySelector('[data-popular-routes]');
    if(!container) return;
    
    showState(container, 'loading');
    
    try {
        // Отримуємо маршрути з Supabase
        const routes = await fetchRoutesFromSupabase();
        
        if (!routes || routes.length === 0) {
            showState(container, 'empty');
            return;
        }
        
        container.innerHTML = "";
        routes.slice(0, 6).forEach(route => {
            const div = document.createElement("div");
            div.className = "route-card";
            div.innerHTML = `
                <div style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="toggleStops(${route.id})">
                    <div>
                        <strong>${escapeHtml(route.from_city)} → ${escapeHtml(route.to_city)}</strong><br>
                        🕐 ${escapeHtml(route.time)} | 💰 ${route.price} грн | ⏱ ${route.duration || '3 год'}<br>
                        <span style="color:#ffc107;">${'⭐'.repeat(Math.floor(route.rating || 0))}</span>
                    </div>
                    <button onclick="event.stopPropagation(); toggleStops(${route.id})" style="background:none; border:none;">▼ Зупинки</button>
                </div>
                <div id="stops-${route.id}" style="display:none; margin-top:10px; padding:10px; background:rgba(0,0,0,0.05); border-radius:8px;">
                    <strong>📍 Зупинки:</strong> ${Array.isArray(route.stops) ? route.stops.map(s => escapeHtml(s)).join(' → ') : 'без зупинок'}
                </div>
                <div style="margin-top:10px;">
                    <button onclick="buyTicket(${route.id})">🎫 Купити</button>
                    <button onclick="toggleFavorite(${route.id})">⭐ Вибране</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Помилка завантаження маршрутів:', error);
        showState(container, 'error', error.message);
    }
}

// ========== ДОПОМІЖНІ ФУНКЦІЇ ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.toggleStops = function(id) { 
    const div = document.getElementById(`stops-${id}`); 
    if(div) div.style.display = div.style.display === 'none' ? 'block' : 'none'; 
};

window.buyTicket = function(routeId) {
    const user = getCurrentUser();
    if(!user) { 
        Swal.fire('Потрібно увійти', '', 'question').then(() => {
            window.location.href = 'login.html';
        });
        return; 
    }
    Swal.fire({ 
        title: 'Квиток', 
        text: 'Функція покупки в розробці', 
        confirmButtonText: '✅ OK' 
    });
};

window.toggleFavorite = function(routeId) { 
    Swal.fire('⭐ Вибране', 'Маршрут додано до обраного', 'success');
};

function showUserStatus() { 
    const user = getCurrentUser(); 
    const statusDiv = document.querySelector('[data-user-status]');
    if(!statusDiv) return;
    statusDiv.innerHTML = user ? 
        `✅ Ви увійшли як ${escapeHtml(user.name)} | <a href="profile.html">Кабінет</a> | <button onclick="logout()">Вийти</button>` : 
        `🔒 Не увійшли | <a href="login.html">Увійти</a> | <a href="register.html">Реєстрація</a>`; 
}

window.logout = function() { 
    logoutUser(); 
    location.reload(); 
};

// ========== ІНІЦІАЛІЗАЦІЯ ==========
function init() {
    // Темна тема
    initTheme();
    updateThemeButton();
    
    // Кнопка теми
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.onclick = toggleTheme;
    }
    
    // Слайдер
    initSlider();
    
    // Маршрути (з Supabase)
    displayRoutes();
    
    // Статус користувача
    showUserStatus();
    
    // Лічильник
    updatePassengerCounter();
    
    console.log('✅ Модуль app.js успішно завантажено!');
}

// Запускаємо після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
