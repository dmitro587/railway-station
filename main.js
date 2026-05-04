let routes=[{id:1,from:"Київ",to:"Львів",time:"08:00",price:450},{id:2,from:"Харків",to:"Одеса",time:"10:30",price:520},{id:3,from:"Київ",to:"Харків",time:"14:15",price:380}];
function saveRoutes(){localStorage.setItem("railway_routes",JSON.stringify(routes))}
function loadRoutes(){const saved=localStorage.getItem("railway_routes");if(saved)routes=JSON.parse(saved);else saveRoutes()}
function showPopularRoutes(){const container=document.getElementById("popular-routes");if(!container)return;container.innerHTML="";routes.forEach(route=>{const div=document.createElement("div");div.className="route-card";div.innerHTML=`<strong>${route.from} → ${route.to}</strong><br>Час: ${route.time} | Ціна: ${route.price} грн<br><button onclick="buyTicket(${route.id})">Купити квиток</button>`;container.appendChild(div)})}
window.buyTicket=function(routeId){const route=routes.find(r=>r.id===routeId);if(!route)return;const cardNumber=prompt("Введіть номер картки (16 цифр):");if(cardNumber&&cardNumber.length===16){alert(`✅ Квиток куплено! ${route.from} → ${route.to}\nОплачено: ${route.price} грн`)}else if(cardNumber){alert("❌ Невірний номер картки")}};
window.searchRoutes=function(){const from=document.getElementById("searchFrom")?.value.toLowerCase();const to=document.getElementById("searchTo")?.value.toLowerCase();const resultsDiv=document.getElementById("searchResults");if(!resultsDiv)return;const found=routes.filter(r=>r.from.toLowerCase().includes(from)&&r.to.toLowerCase().includes(to));if(found.length===0){resultsDiv.innerHTML="<p>❌ Маршрутів не знайдено</p>"}else{resultsDiv.innerHTML=found.map(r=>`<div class="route-card"><strong>${r.from} → ${r.to}</strong><br>Час: ${r.time} | Ціна: ${r.price} грн<br><button onclick="buyTicket(${r.id})">Купити</button></div>`).join("")}};
loadRoutes();showPopularRoutes();
// ========== РОБОТА З КОРИСТУВАЧАМИ ТА КВИТКАМИ ==========
window.buyTicketWithAuth = function(routeId) {
    const user = JSON.parse(localStorage.getItem('current_user'));
    if (!user) {
        if (confirm('Для покупки квитка потрібно увійти. Перейти на сторінку входу?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    const route = routes.find(r => r.id === routeId);
    if (!route) return;
    
    const cardNumber = prompt("Введіть номер картки (16 цифр):");
    if (cardNumber && cardNumber.length === 16) {
        // Зберігаємо квиток у користувача
        const ticket = {
            id: Date.now(),
            from: route.from,
            to: route.to,
            time: route.time,
            price: route.price,
            date: new Date().toLocaleDateString()
        };
        
        user.tickets = user.tickets || [];
        user.tickets.push(ticket);
        
        // Оновлюємо дані користувача в localStorage
        const users = JSON.parse(localStorage.getItem('railway_users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('railway_users', JSON.stringify(users));
        }
        localStorage.setItem('current_user', JSON.stringify(user));
        
        alert(`✅ Квиток куплено! ${route.from} → ${route.to}\nОплачено: ${route.price} грн\nКвиток збережено в особистому кабінеті`);
    } else if (cardNumber) {
        alert("❌ Невірний номер картки");
    }
};
