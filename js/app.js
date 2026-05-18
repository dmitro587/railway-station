// ========== ГОЛОВНИЙ МОДУЛЬ ==========
import { initTheme, toggleTheme, updateThemeButton } from './ui/theme.js';
import { getRoutes, getFavorites, addPriceAlert, addSearchHistory, getTicketStats } from './services/storage.js';
import { isLoggedIn, getCurrentUser, logoutUser, requireAuth } from './services/auth.js';
import { renderCards } from './ui/cards.js';

// Глобальні змінні
let allRoutes = [];

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
let dotsContainer = null;

function initSlider() {
    slides = document.querySelectorAll('.slide');
    dotsContainer = document.getElementById('dots');
    if (!slides.length || !dotsContainer) return;
    
    createDots();
    setInterval(() => { nextSlide(); }, 5000);
}

function createDots() {
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
let routes = [
    { id:1, from:"Київ", to:"Львів", price:450, time:"08:00", duration:"5 год", rating:4.5, stops:[{name:"Київ",price:0,time:"08:00"},{name:"Житомир",price:120,time:"09:30"},{name:"Рівне",price:250,time:"11:00"},{name:"Львів",price:450,time:"13:00"}] },
    { id:2, from:"Київ", to:"Одеса", price:420, time:"09:30", duration:"4.5 год", rating:4.8, stops:[{name:"Київ",price:0,time:"09:30"},{name:"Біла Церква",price:100,time:"10:45"},{name:"Умань",price:200,time:"12:00"},{name:"Одеса",price:420,time:"14:00"}] },
    { id:3, from:"Київ", to:"Харків", price:380, time:"07:15", duration:"4.5 год", rating:4.2, stops:[{name:"Київ",price:0,time:"07:15"},{name:"Полтава",price:220,time:"09:30"},{name:"Харків",price:380,time:"11:45"}] },
    { id:4, from:"Київ", to:"Дніпро", price:350, time:"10:00", duration:"4 год", rating:4.3, stops:[{name:"Київ",price:0,time:"10:00"},{name:"Кременчук",price:200,time:"12:00"},{name:"Дніпро",price:350,time:"14:00"}] },
    { id:5, from:"Київ", to:"Запоріжжя", price:400, time:"11:30", duration:"5 год", rating:4.0, stops:[{name:"Київ",price:0,time:"11:30"},{name:"Кременчук",price:200,time:"13:30"},{name:"Дніпро",price:300,time:"15:00"},{name:"Запоріжжя",price:400,time:"16:30"}] },
    { id:6, from:"Львів", to:"Київ", price:460, time:"07:00", duration:"5.5 год", rating:4.7, stops:[{name:"Львів",price:0,time:"07:00"},{name:"Рівне",price:200,time:"08:30"},{name:"Житомир",price:320,time:"10:00"},{name:"Київ",price:460,time:"12:30"}] },
    { id:7, from:"Львів", to:"Ужгород", price:350, time:"08:30", duration:"3.5 год", rating:4.9, stops:[{name:"Львів",price:0,time:"08:30"},{name:"Стрий",price:80,time:"09:15"},{name:"Мукачево",price:250,time:"10:30"},{name:"Ужгород",price:350,time:"12:00"}] },
    { id:8, from:"Одеса", to:"Київ", price:440, time:"08:00", duration:"5 год", rating:4.7, stops:[{name:"Одеса",price:0,time:"08:00"},{name:"Умань",price:220,time:"10:00"},{name:"Біла Церква",price:340,time:"11:30"},{name:"Київ",price:440,time:"13:00"}] },
    { id:9, from:"Харків", to:"Київ", price:400, time:"06:30", duration:"4.5 год", rating:4.6, stops:[{name:"Харків",price:0,time:"06:30"},{name:"Полтава",price:160,time:"08:00"},{name:"Київ",price:400,time:"11:00"}] },
    { id:10, from:"Дніпро", to:"Львів", price:580, time:"20:00", duration:"10 год", rating:4.7, stops:[{name:"Дніпро",price:0,time:"20:00"},{name:"Кременчук",price:150,time:"21:30"},{name:"Кропивницький",price:250,time:"23:00"},{name:"Вінниця",price:400,time:"02:00"},{name:"Львів",price:580,time:"06:00"}] }
];

function displayRoutes() {
    const container = document.querySelector('[data-popular-routes]');
    if(!container) return;
    container.innerHTML = "";
    routes.slice(0, 6).forEach(route => {
        const div = document.createElement("div");
        div.className = "route-card";
        div.innerHTML = `
            <div style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="toggleStops(${route.id})">
                <div><strong>${route.from} → ${route.to}</strong><br>🕐 ${route.time} | 💰 ${route.price} грн | ⏱ ${route.duration}<br><span style="color:#ffc107;">${'⭐'.repeat(Math.floor(route.rating))} ${route.rating}</span></div>
                <button onclick="event.stopPropagation(); toggleStops(${route.id})" style="background:none; border:none;">▼ Зупинки</button>
            </div>
            <div id="stops-${route.id}" style="display:none; margin-top:10px; padding:10px; background:rgba(0,0,0,0.05); border-radius:8px;">
                <strong>📍 Всі зупинки:</strong>
                ${route.stops.map(stop => `<div><span>${stop.name}</span> - 🕐 ${stop.time} | 💰 ${stop.price} грн</div>`).join('')}
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
        Swal.fire('Потрібно увійти', '', 'question').then(()=>window.location.href='login.html'); 
        return; 
    }
    const route = routes.find(r=>r.id===routeId);
    const date = new Date().toLocaleDateString();
    Swal.fire({ title: `Квиток ${route.from}→${route.to}`, text: `Сума: ${route.price} грн\nДата: ${date}`, confirmButtonText: '✅ Підтвердити' }).then(() => {
        const ticket = { id: Date.now(), from: route.from, to: route.to, price: route.price, date: date, time: route.time };
        user.tickets = user.tickets || [];
        user.tickets.push(ticket);
        localStorage.setItem('current_user', JSON.stringify(user));
        const users = JSON.parse(localStorage.getItem('railway_users')||'[]');
        const idx = users.findIndex(u=>u.id===user.id);
        if(idx!==-1) users[idx]=user;
        localStorage.setItem('railway_users', JSON.stringify(users));
        updatePassengerCounter();
        Swal.fire('✅ Успіх!', 'Квиток куплено! Перевірте кабінет.', 'success');
    });
};

window.toggleFavorite = function(routeId) { 
    let fav = JSON.parse(localStorage.getItem('favorites')||'[]'); 
    fav.includes(routeId) ? fav.splice(fav.indexOf(routeId),1) : fav.push(routeId); 
    localStorage.setItem('favorites',JSON.stringify(fav)); 
    Swal.fire('','⭐ Готово','success'); 
};

function showUserStatus() { 
    const user = getCurrentUser(); 
    const statusDiv = document.querySelector('[data-user-status]');
    if(!statusDiv) return;
    statusDiv.innerHTML = user ? `✅ Ви увійшли як ${user.name} | 🎫 Квитків: ${user.tickets?.length||0} | <a href="profile.html">Кабінет</a> | <button onclick="logout()">Вийти</button>` : `🔒 Не увійшли | <a href="login.html">Увійти</a> | <a href="register.html">Реєстрація</a>`; 
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
}

// Запускаємо після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
