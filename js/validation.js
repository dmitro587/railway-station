// ========== ВАЛІДАЦІЯ ФОРМ ==========
export function validateContactRequest(payload) {
    const errors = {};
    
    if (!payload.name || payload.name.trim().length < 2) {
        errors.name = 'Ім\'я повинно містити хоча б 2 символи';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email || !emailRegex.test(payload.email)) {
        errors.email = 'Введіть коректну email адресу';
    }
    
    if (!payload.subject || payload.subject.trim().length < 3) {
        errors.subject = 'Тема занадто коротка (мін. 3 символи)';
    }
    
    if (!payload.message || payload.message.trim().length < 10) {
        errors.message = 'Повідомлення повинно містити хоча б 10 символів';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRegistration(payload) {
    const errors = {};
    
    if (!payload.name || payload.name.trim().length < 2) {
        errors.name = 'Ім\'я повинно містити хоча б 2 символи';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email || !emailRegex.test(payload.email)) {
        errors.email = 'Введіть коректну email адресу';
    }
    
    if (!payload.password || payload.password.length < 4) {
        errors.password = 'Пароль повинен містити хоча б 4 символи';
    }
    
    if (payload.password !== payload.confirmPassword) {
        errors.confirmPassword = 'Паролі не співпадають';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(payload) {
    const errors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email || !emailRegex.test(payload.email)) {
        errors.email = 'Введіть коректну email адресу';
    }
    
    if (!payload.password || payload.password.length < 1) {
        errors.password = 'Введіть пароль';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
}
