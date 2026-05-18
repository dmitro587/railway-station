// ========== АВТОРИЗАЦІЯ ==========
const USERS_KEY = 'railway_users';
const SESSION_KEY = 'current_user';

// Отримати всіх користувачів
export function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// Зберегти всіх користувачів
export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Отримати поточного користувача
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

// Встановити поточного користувача
export function setCurrentUser(user) {
    if (!user) {
        localStorage.removeItem(SESSION_KEY);
        return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Перевірка, чи користувач залогінений
export function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Отримати роль поточного користувача
export function getCurrentUserRole() {
    const user = getCurrentUser();
    return user?.role || 'guest';
}

// Перевірка, чи є користувач адміністратором
export function isAdmin() {
    return getCurrentUserRole() === 'admin';
}

// Реєстрація нового користувача
export function registerUser(name, email, password) {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'Користувач з таким email вже існує' };
    }
    
    const newUser = {
        id: `u_${Date.now()}`,
        name,
        email,
        password,
        role: 'user',
        tickets: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    
    return { success: true, user: newUser };
}

// Вхід користувача
export function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, error: 'Невірний email або пароль' };
    }
    
    setCurrentUser(user);
    return { success: true, user };
}

// Вихід користувача
export function logoutUser() {
    setCurrentUser(null);
}

// Вимога авторизації (перевіряє чи залогінений)
export function requireAuth(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Вимога ролі адміністратора
export function requireAdmin(redirectUrl = 'index.html') {
    if (!isAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Зміна пароля
export function changePassword(oldPassword, newPassword) {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'Не авторизований' };
    
    if (user.password !== oldPassword) {
        return { success: false, error: 'Старий пароль невірний' };
    }
    
    if (newPassword.length < 4) {
        return { success: false, error: 'Новий пароль повинен мати не менше 4 символів' };
    }
    
    user.password = newPassword;
    setCurrentUser(user);
    
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        saveUsers(users);
    }
    
    return { success: true };
}
