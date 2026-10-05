const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_URL = (
    configuredApiUrl || "https://stargymdashboard.netlify.app"
).replace(/\/$/, "");

export function saveSession(data: { csrfToken: string; user: unknown }) {
    sessionStorage.setItem("csrfToken", data.csrfToken);
    localStorage.setItem("user", JSON.stringify(data.user));
}

export function clearSession() {
    sessionStorage.removeItem("csrfToken");
    localStorage.removeItem("user");
}

export function resolveApiAsset(path: string | null) {
    if (!path) return null;
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    const headers = new Headers(options.headers);
    const method = (options.method || "GET").toUpperCase();
    const csrfToken = sessionStorage.getItem("csrfToken");

    if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
    }

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
            credentials: "include",
        }
    );

    if (
        response.status === 401 &&
        !["/api/auth/login", "/api/auth/session"].includes(endpoint)
    ) {
        clearSession();
        window.dispatchEvent(new Event("auth-session-expired"));

        throw new Error("Session expired");
    }

    return response;
}
