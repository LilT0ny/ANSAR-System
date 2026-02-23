// =============================================
// ANSAR System – Centralized API Service
// =============================================
// All requests go through the Gateway (nginx proxies /api/ to gateway:8000)
// Gateway then routes to the appropriate microservice.

const API_URL = "/api/v1";

// ── Helper: get auth headers ──────────────────────────────────
function authHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

// ── Helper: handle response ───────────────────────────────────
async function handleResponse(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Error desconocido" }));
        // Pydantic returns detail as array of objects for validation errors
        let message = `Error ${res.status}`;
        if (typeof body.detail === 'string') {
            message = body.detail;
        } else if (Array.isArray(body.detail)) {
            message = body.detail.map(e => `${(e.loc || []).slice(-1).join('.')}: ${e.msg}`).join('; ');
        } else if (body.detail && typeof body.detail === 'object') {
            message = JSON.stringify(body.detail);
        }
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }
    // 204 No Content (e.g. DELETE)
    if (res.status === 204) return null;
    return res.json();
}

// ── AUTH ───────────────────────────────────────────────────────
export const authAPI = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(res);
    },

    register: async (userData) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return handleResponse(res);
    },

    me: async () => {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },
};

// ── PATIENTS ──────────────────────────────────────────────────
export const patientsAPI = {
    list: async () => {
        const res = await fetch(`${API_URL}/patients/`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    getById: async (id) => {
        const res = await fetch(`${API_URL}/patients/${id}`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    search: async (query) => {
        const res = await fetch(`${API_URL}/patients/search?q=${encodeURIComponent(query)}`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    create: async (patientData) => {
        const res = await fetch(`${API_URL}/patients/`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(patientData),
        });
        return handleResponse(res);
    },

    update: async (id, patientData) => {
        const res = await fetch(`${API_URL}/patients/${id}`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(patientData),
        });
        return handleResponse(res);
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/patients/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    // Clinical History (questionnaire)
    getHistory: async (patientId) => {
        const res = await fetch(`${API_URL}/patients/${patientId}/history`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    upsertHistory: async (patientId, data) => {
        const res = await fetch(`${API_URL}/patients/${patientId}/history`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    createHistoryRecord: async (patientId, data) => {
        const res = await fetch(`${API_URL}/patients/${patientId}/history`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    // Odontogram
    getOdontogram: async (patientId) => {
        const res = await fetch(`${API_URL}/patients/${patientId}/odontogram`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    updateOdontogram: async (patientId, data) => {
        const res = await fetch(`${API_URL}/patients/${patientId}/odontogram`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ data }),
        });
        return handleResponse(res);
    },
};

// ── APPOINTMENTS ──────────────────────────────────────────────
export const appointmentsAPI = {
    list: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_URL}/appointments${query ? "?" + query : ""}`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    create: async (data) => {
        const res = await fetch(`${API_URL}/appointments`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    update: async (id, data) => {
        const res = await fetch(`${API_URL}/appointments/${id}`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/appointments/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    // Ortho Blocks
    listOrthoBlocks: async () => {
        const res = await fetch(`${API_URL}/ortho-blocks`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    createOrthoBlock: async (data) => {
        const res = await fetch(`${API_URL}/ortho-blocks`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    deleteOrthoBlock: async (id) => {
        const res = await fetch(`${API_URL}/ortho-blocks/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    // Public endpoints
    getAvailability: async (date) => {
        const res = await fetch(`${API_URL}/public/availability?date=${date}`);
        return handleResponse(res);
    },

    getOrthoDates: async () => {
        const res = await fetch(`${API_URL}/public/ortho-dates`);
        return handleResponse(res);
    },

    publicBookOrtho: async (data) => {
        const res = await fetch(`${API_URL}/public/book-ortho`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationsAPI = {
    list: async () => {
        const res = await fetch(`${API_URL}/notifications/`, {
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    send: async (data) => {
        const res = await fetch(`${API_URL}/notifications/send`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
};

// Legacy export for backward compatibility
export const api = { auth: authAPI };
