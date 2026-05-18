// ========== ГОЛОВНИЙ МОДУЛЬ ==========
import { initTheme, toggleTheme, updateThemeButton } from './ui/theme.js';
import { getRoutes, getFavorites, addPriceAlert, getTicketStats } from './services/storage.js';
import { getCurrentUser, logoutUser } from './services/auth.js';

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

// ========== МАРШРУТИ ==========
const routes = [
    { id:1, from:"Київ", to:"Львів", price:450, time:"08:00", duration:"5 год", rating:4.5, stops:["Житомир", "Рівне"] },
    { id:2, from:"Київ", to:"Одеса", price:420, time:"09:30", duration:"4.5 год", rating:4.8, stops:["Біла Церква", "Умань"] },
    { id:3, from:"Київ", to:"Харків", price:380, time:"07:15", duration:"4.5 год", rating:4.2, stops:["Полтава"] },
    { id:4, from:"Київ", to:"Дніпро", price:350, time:"10:00", duration:"4 год", rating:4.3, stops:["Кременчук"] },
    { id:5, from:"Київ", to:"Запоріжжя", price:400, time:"11:30", duration:"5 год", rating:4.0, stops:["Кременчук", "Дніпро"] },
    { id:6, from:"Львів", to:"Київ", price:460, time:"07:00", duration:"5.5 год", rating:4.7, stops:["Рівне", "Житомир"] }
];

function displayRoutes() {
    const container = document.querySelector('[data-popular-routes]');
    if(!container) return;
    container.innerHTML = "";
    routes.forEach(route => {
        const div = document.createElement("div");
        div.className = "route-card";
        div.innerHTML = `
            <div style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="toggleStops(${route.id})">
                <div>
                    <strong>${route.from} → ${route.to}</strong><br>
                    🕐 ${route.time} | 💰 ${route.price} грн | ⏱ ${route.duration}<br>
                    <span style="color:#ffc107;">${'⭐'.repeat(Math.floor(route.rating))} ${route.rating}</span>
                </div>
                <button onclick="event.stopPropagation(); toggleStops(${route.id})" style="background:none; border:none;">▼ Зупинки</button>
            </div>
            <div id="stops-${route.id}" style="display:none; margin-top:10px; padding:10px; background:rgba(0,0,0,0.05); border-radius:8px;">
                <strong>📍 Зупинки:</strong> ${route.stops.join(' → ')}
            </div>
            <div style="margin-top:10px;">
                <button onclick="buyTicket(${route.id})">🎫 Купити</button>
                <button onclick="toggleFavorite(${route.id})">⭐ Вибране</button>
            </div>
        `;
        container.appendChild(div);
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
    const route = routes.find(r => r.id === routeId);
    Swal.fire({ 
        title: `Квиток ${route.from} → ${route.to}`, 
        text: `Сума: ${route.price} грн`, 
        confirmButtonText: '✅ Купити' 
    }).then(() => {
        Swal.fire('✅ Успіх!', 'Квиток куплено!', 'success');
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
        `✅ Ви увійшли як ${user.name} | <a href="profile.html">Кабінет</a> | <button onclick="logout()">Вийти</button>` : 
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
    
    // Маршрути
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
