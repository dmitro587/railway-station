// ========== РОБОТА З ФОРМАМИ ==========
export function showErrors(form, errors) {
    // Очищаємо попередні помилки
    form.querySelectorAll('[data-error]').forEach(el => {
        const fieldName = el.dataset.error;
        if (errors[fieldName]) {
            el.textContent = errors[fieldName];
            el.hidden = false;
            // Додаємо клас помилки до поля
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input) input.classList.add('input-error');
        } else {
            el.textContent = '';
            el.hidden = true;
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input) input.classList.remove('input-error');
        }
    });
}

export function clearForm(form) {
    form.reset();
    showErrors(form, {});
}

export function getFormData(form) {
    return Object.fromEntries(new FormData(form));
}

export function showFormStatus(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    element.className = isError ? 'status error' : 'status success';
    
    if (!isError) {
        setTimeout(() => {
            element.hidden = true;
        }, 5000);
    }
}
