// ========== МАРШРУТИ ==========
let routes = [
    { id: 1, from: "Київ", to: "Львів", time: "08:00", price: 450, duration: "5 год" },
    { id: 2, from: "Харків", to: "Одеса", time: "10:30", price: 520, duration: "6 год" },
    { id: 3, from: "Київ", to: "Харків", time: "14:15", price: 380, duration: "4.5 год" },
    { id: 4, from: "Львів", to: "Київ", time: "09:00", price: 460, duration: "5 год" },
    { id: 5, from: "Одеса", to: "Харків", time: "15:45", price: 530, duration: "6.5 год" }
];

// ========== ВІДГУКИ ==========
let reviews = JSON.parse(localStorage.getItem('railway_reviews') || '[]');

// ========== ЗБЕРЕЖЕННЯ ==========
function saveRoutes() { localStorage.setItem("railway_routes", JSON.stringify(routes)); }
function loadRoutes() { const saved = localStorage.getItem("railway_routes"); if(saved) routes = JSON.parse(saved); else saveRoutes(); }

// ========== ПОПУЛЯРНІ МАРШРУТИ ==========
function showPopularRoutes() {
    const container = document.getElementById("popular-routes");
    if(!container) return;
    container.innerHTML = "";
    routes.slice(0, 5).forEach(route => {
        const div = document.createElement("div");
        div.className = "route-card";
        div.innerHTML = `
            <strong>${route.from} → ${route.to}</strong><br>
            🕐 ${route.time} | 💰 ${route.price} грн | ⏱ ${route.duration}<br>
            <button onclick="buyTicket(${route.id})">🎫 Купити</button>
            <button onclick="toggleFavorite(${route.id})">⭐ Вибране</button>
            <button onclick="showReviews(${route.id})">💬 Відгуки (${getReviewCount(route.id)})</button>
        `;
        container.appendChild(div);
    });
}

function getReviewCount(routeId) { return reviews.filter(r => r.routeId === routeId).length; }

// ========== ВИБРАНЕ ==========
function toggleFavorite(routeId) {
    let fav = JSON.parse(localStorage.getItem('favorites') || '[]');
    if(fav.includes(routeId)) {
        fav = fav.filter(id => id !== routeId);
        alert('⭐ Видалено з вибраного');
    } else {
        fav.push(routeId);
        alert('⭐ Додано до вибраного!');
    }
    localStorage.setItem('favorites', JSON.stringify(fav));
}

// ========== ПОКУПКА КВИТКА З ВИБОРОМ МІСЦЯ ==========
window.buyTicket = function(routeId) {
    const user = JSON.parse(localStorage.getItem('current_user'));
    if(!user) {
        if(confirm('Потрібно увійти. Перейти на вхід?')) window.location.href='login.html';
        return;
    }
    const route = routes.find(r => r.id === routeId);
    if(!route) return;
    
    const seat = prompt(`Виберіть місце (1-32) для ${route.from} → ${route.to}:`);
    if(seat && seat >= 1 && seat <= 32) {
        const cardNumber = prompt("Введіть номер картки (16 цифр):");
        if(cardNumber && cardNumber.length === 16) {
            const ticket = {
                id: Date.now(),
                from: route.from, to: route.to, time: route.time,
                price: route.price, date: new Date().toLocaleDateString(),
                seat: seat, duration: route.duration
            };
            user.tickets = user.tickets || [];
            user.tickets.push(ticket);
            const users = JSON.parse(localStorage.getItem('railway_users')||'[]');
            const idx = users.findIndex(u=>u.id===user.id);
            if(idx!==-1) users[idx]=user;
            localStorage.setItem('railway_users', JSON.stringify(users));
            localStorage.setItem('current_user', JSON.stringify(user));
            
            // Оновлюємо статистику продажів
            let stats = JSON.parse(localStorage.getItem('ticket_stats') || '[]');
            stats.push({ routeId, from: route.from, to: route.to, price: route.price, date: new Date().toLocaleDateString() });
            localStorage.setItem('ticket_stats', JSON.stringify(stats));
            
            alert(`✅ Квиток куплено! ${route.from} → ${route.to}\nМісце: ${seat}\nОплачено: ${route.price} грн`);
        } else alert("❌ Невірна картка");
    }
};

// ========== ВІДГУКИ ==========
window.showReviews = function(routeId) {
    const route = routes.find(r => r.id === routeId);
    const routeReviews = reviews.filter(r => r.routeId === routeId);
    let reviewText = prompt(`Відгуки про ${route.from}→${route.to}:\n${routeReviews.map(r=>`⭐${r.rating} ${r.text}`).join('\n')||'Немає відгуків'}\n\nДодати відгук? (1-5 зірка, текст)`);
    if(reviewText) {
        const match = reviewText.match(/^([1-5])\s*(.*)$/);
        if(match) {
            reviews.push({ routeId, rating: match[1], text: match[2], user: JSON.parse(localStorage.getItem('current_user')||'{}').name || 'Анонім', date: new Date().toLocaleDateString() });
            localStorage.setItem('railway_reviews', JSON.stringify(reviews));
            alert('✅ Відгук додано!');
        } else alert('Формат: "4 Гарний потяг"');
    }
};

// ========== ПОШУК З ДАТОЮ ==========
window.searchRoutes = function() {
    const from = document.getElementById("searchFrom")?.value.toLowerCase();
    const to = document.getElementById("searchTo")?.value.toLowerCase();
    const date = document.getElementById("searchDate")?.value;
    const resultsDiv = document.getElementById("searchResults");
    if(!resultsDiv) return;
    let found = routes.filter(r => r.from.toLowerCase().includes(from) && r.to.toLowerCase().includes(to));
    resultsDiv.innerHTML = found.length ? found.map(r => `<div class="route-card"><strong>${r.from}→${r.to}</strong> 🕐${r.time} 💰${r.price}грн ${date ? `📅${date}` : ''}<br><button onclick="buyTicket(${r.id})">Купити</button></div>`).join('') : "<p>❌ Не знайдено</p>";
};

loadRoutes(); showPopularRoutes();
