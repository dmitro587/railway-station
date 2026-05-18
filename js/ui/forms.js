// ========== РОБОТА З ФОРМАМИ ==========
export function showErrors(form, errors) {
    form.querySelectorAll('[data-error]').forEach(el => {
        const fieldName = el.dataset.error;
        if (errors[fieldName]) {
            el.textContent = errors[fieldName];
            el.hidden = false;
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input) input.classList.add('error');
        } else {
            el.textContent = '';
            el.hidden = true;
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input) input.classList.remove('error');
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

export function prefillForm(form, data) {
    for (const [key, value] of Object.entries(data)) {
        const field = form.elements[key];
        if (field && !field.value) {
            field.value = value;
        }
    }
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
