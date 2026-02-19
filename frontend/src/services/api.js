const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = {
    auth: {
        login: async (credentials) => {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Error al iniciar sesión");
            }
            return res.json();
        },
        register: async (userData) => {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (!res.ok) throw new Error("Error en registro");
            return res.json();
        }
    }
};
