// ========== РОБОТА З LOCALSTORAGE ==========
const USERS_KEY = 'railway_users';
const SESSION_KEY = 'current_user';
const ROUTES_KEY = 'railway_routes';
const TICKET_STATS_KEY = 'ticket_stats';
const PRICE_ALERTS_KEY = 'price_alerts';
const BOOKED_SEATS_KEY = 'booked_seats';
const FAVORITES_KEY = 'favorites';
const CONTACTS_KEY = 'contact_requests';
const APPLICATIONS_KEY = 'applications';
const SEARCH_HISTORY_KEY = 'search_history';

// ========== КОРИСТУВАЧІ ==========
export function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

export function setCurrentUser(user) {
    if (!user) {
        localStorage.removeItem(SESSION_KEY);
        return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// ========== МАРШРУТИ ==========
export function getRoutes() {
    return JSON.parse(localStorage.getItem(ROUTES_KEY) || '[]');
}

export function saveRoutes(routes) {
    localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}

export function addRoute(route) {
    const routes = getRoutes();
    const newId = routes.length > 0 ? Math.max(...routes.map(r => r.id)) + 1 : 1;
    routes.push({ ...route, id: newId });
    saveRoutes(routes);
    return routes;
}

export function updateRoute(id, updatedRoute) {
    const routes = getRoutes();
    const index = routes.findIndex(r => r.id === id);
    if (index !== -1) {
        routes[index] = { ...routes[index], ...updatedRoute };
        saveRoutes(routes);
    }
    return routes;
}

export function deleteRoute(id) {
    const routes = getRoutes().filter(r => r.id !== id);
    saveRoutes(routes);
    return routes;
}

// ========== СТАТИСТИКА ==========
export function getTicketStats() {
    return JSON.parse(localStorage.getItem(TICKET_STATS_KEY) || '[]');
}

export function addTicketStat(stat) {
    const stats = getTicketStats();
    stats.push(stat);
    localStorage.setItem(TICKET_STATS_KEY, JSON.stringify(stats));
}

// ========== ПІДПИСКИ НА ЗНИЖКИ ==========
export function getPriceAlerts() {
    return JSON.parse(localStorage.getItem(PRICE_ALERTS_KEY) || '[]');
}

export function addPriceAlert(routeId) {
    const alerts = getPriceAlerts();
    if (!alerts.includes(routeId)) {
        alerts.push(routeId);
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
    }
}

// ========== ЗАБРОНЬОВАНІ МІСЦЯ ==========
export function getBookedSeats() {
    return JSON.parse(localStorage.getItem(BOOKED_SEATS_KEY) || '[]');
}

export function addBookedSeats(seats) {
    const booked = getBookedSeats();
    booked.push(...seats);
    localStorage.setItem(BOOKED_SEATS_KEY, JSON.stringify(booked));
}

// ========== ВИБРАНЕ ==========
export function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
}

export function toggleFavorite(routeId) {
    const fav = getFavorites();
    if (fav.includes(routeId)) {
        const newFav = fav.filter(id => id !== routeId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFav));
        return newFav;
    } else {
        fav.push(routeId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(fav));
        return fav;
    }
}

// ========== КОНТАКТНІ ЗАПИТИ ==========
export function getContactRequests() {
    return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
}

export function addContactRequest(request) {
    const requests = getContactRequests();
    requests.push({
        id: `c_${Date.now()}`,
        status: 'new',
        createdAt: new Date().toISOString(),
        ...request
    });
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(requests));
}

// ========== ІСТОРІЯ ПОШУКУ ==========
export function getSearchHistory() {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
}

export function addSearchHistory(from, to) {
    if (!from && !to) return;
    const history = getSearchHistory();
    const newSearch = { from, to, date: new Date().toLocaleString() };
    const updated = [newSearch, ...history.filter(h => !(h.from === from && h.to === to))].slice(0, 5);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
}
