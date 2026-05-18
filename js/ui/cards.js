// ========== РЕНДЕР КАРТОК МАРШРУТІВ ==========
export function createCard(route, withButtons = true) {
    const childPrice = Math.round(route.price * 0.5);
    
    return `
        <article class="route-card" data-route-id="${route.id}">
            <div class="route-header">
                <div>
                    <strong>${escapeHtml(route.from)} → ${escapeHtml(route.to)}</strong><br>
                    🕐 ${escapeHtml(route.time)} | 💰 ${route.price} грн | ⏱ ${escapeHtml(route.duration || '3 год')}
                </div>
            </div>
            ${withButtons ? `
                <div class="route-actions">
                    <button class="buy-btn" data-action="buy" data-id="${route.id}">🎫 Купити</button>
                    <button class="favorite-btn" data-action="favorite" data-id="${route.id}">⭐ Вибране</button>
                    <button class="notify-btn" data-action="notify" data-id="${route.id}">🔔 Стежити</button>
                    <button class="print-btn" data-action="print" data-id="${route.id}">🖨️ Друк</button>
                </div>
            ` : ''}
        </article>
    `;
}

export function renderCards(container, routes, withButtons = true) {
    if (!container) return;
    
    if (!routes || routes.length === 0) {
        container.innerHTML = '<p class="empty-state">🚆 Немає маршрутів</p>';
        return;
    }
    
    container.innerHTML = routes.map(route => createCard(route, withButtons)).join('');
}

export function renderAdminRoutes(container, routes, onEdit, onDelete) {
    if (!container) return;
    
    if (!routes || routes.length === 0) {
        container.innerHTML = '<p class="empty-state">📋 Немає маршрутів</p>';
        return;
    }
    
    container.innerHTML = routes.map(route => `
        <div class="route-card admin-card">
            <strong>${escapeHtml(route.from)} → ${escapeHtml(route.to)}</strong><br>
            🕐 ${escapeHtml(route.time)} | 💰 ${route.price} грн
            <div class="admin-actions">
                <button class="edit-btn" data-id="${route.id}">✏ Редагувати</button>
                <button class="delete-btn" data-id="${route.id}">🗑 Видалити</button>
            </div>
        </div>
    `).join('');
}

// Захист від XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
