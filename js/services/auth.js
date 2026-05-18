import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage.js';

// ========== АВТОРИЗАЦІЯ ==========
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

export function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, error: 'Невірний email або пароль' };
    }
    
    setCurrentUser(user);
    return { success: true, user };
}

export function logoutUser() {
    setCurrentUser(null);
}

export function isLoggedIn() {
    return getCurrentUser() !== null;
}

export function getCurrentUserRole() {
    const user = getCurrentUser();
    return user?.role || 'guest';
}

export function isAdmin() {
    return getCurrentUserRole() === 'admin';
}

export function requireAuth(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

export function requireAdmin(redirectUrl = 'index.html') {
    if (!isAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

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
