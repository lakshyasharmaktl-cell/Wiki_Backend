export const validname = (name) => {
    if (!name || typeof name !== 'string') return false;
    const nameRe = /^[A-Za-z0-9\s._'-]{2,60}$/;
    return nameRe.test(name.trim());
};

export const validEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRe.test(email.trim());
};

export const validpassword = (pass) => {
    if (!pass || typeof pass !== 'string') return false;
    // Allow at least 6 characters with letters and numbers/special chars
    return pass.length >= 6;
};
