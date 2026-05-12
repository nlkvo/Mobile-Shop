export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const getFullName = () => localStorage.getItem('full_name');

export const login = (token, role, full_name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('full_name', full_name);
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('full_name');
};

export const isLoggedIn = () => !!getToken();