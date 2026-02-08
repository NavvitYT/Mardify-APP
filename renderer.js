// ╔══════════════════════════════════════════════════════════════╗
// ║              MARDIFY APP - RENDERER LOGIC                       ║
// ║        Lógica compartida y funciones de API                    ║
// ╚══════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════
// FETCH API - Cliente HTTP nativo del navegador
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://basededatos.gokucomdohd.pro';
// TODOS los endpoints usan el mismo host
const CHAT_API_BASE = 'https://basededatos.gokucomdohd.pro';

// Helper para hacer peticiones HTTP con fetch
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            signal: controller.signal,
            credentials: 'include'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('⏱️ La solicitud tardó demasiado. Verifica tu conexión.');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('🌐 Sin conexión al servidor. Verifica tu internet.');
        }
        
        console.error('❌ Error de API:', error);
        throw error;
    }
}

// Helper para peticiones al chat (mismo host que API)
async function chatApiRequest(endpoint, options = {}) {
    const url = `${CHAT_API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            signal: controller.signal,
            credentials: 'include'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('⏱️ La solicitud de chat tardó demasiado.');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('🌐 Sin conexión al servidor de chat.');
        }
        
        console.error('❌ Error de Chat API:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// API AUTH - Login y Registro
// ═══════════════════════════════════════════════════════════════

const API = {
    // ═══════════════════════════════════════════════════════════════
    // AUTENTICACIÓN
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Iniciar sesión de usuario
     */
    login: async (email, password) => {
        try {
            console.log('🔐 Login:', email);
            const data = await apiRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            const token = data.token || data.accessToken || data.auth_token;
            if (token) {
                window.appAPI.saveToken(token);
                window.appAPI.saveSession(data.user || data);
            }
            
            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    },
    
    /**
     * Registrar nuevo usuario
     */
    register: async (userData) => {
        try {
            return await apiRequest('/api/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        } catch (error) {
            console.error('❌ Register error:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // USUARIOS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Buscar usuarios
     */
    searchUsers: async (query = '') => {
        const endpoints = [
            query ? `/api/user/${encodeURIComponent(query)}` : '/api/user/',
            query ? `/search/api/user/${encodeURIComponent(query)}` : '/search/api/user/',
            query ? `/users/search/${encodeURIComponent(query)}` : '/users/',
        ];
        
        let lastError = null;
        
        for (const endpoint of endpoints) {
            try {
                const token = window.appAPI.getToken();
                const data = await apiRequest(endpoint, { 
                    method: 'GET',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                
                let users = [];
                if (Array.isArray(data)) {
                    users = data;
                } else if (data && typeof data === 'object') {
                    users = data.users || data.data || data.results || [];
                }
                
                if (Array.isArray(users)) {
                    return users;
                }
                
            } catch (error) {
                lastError = error;
                if (error.message.includes('404')) continue;
                throw error;
            }
        }
        
        throw lastError || new Error('No se pudo conectar');
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CHAT - Todo usa basededatos.gokucomdohd.pro
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Enviar mensaje al chat - Endpoint: /api/chat/send
     */
    sendMessage: async (userId, message) => {
        // 1. Limpiamos el mensaje de espacios vacíos
        const cleanMessage = message ? message.trim() : "";

        if (!userId || !cleanMessage) {
            console.error("❌ No se puede enviar: ", { userId, cleanMessage });
            throw new Error("Datos incompletos antes de enviar");
        }

        const response = await fetch(`https://basededatos.gokucomdohd.pro/api/chat/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: String(userId), // <--- DEBE LLAMARSE userId
                message: cleanMessage    // <--- DEBE LLAMARSE message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}`);
        }
        return await response.json();
    },
    
    /**
     * Cargar mensajes del chat - Endpoint: /api/chat
     */
    loadChat: async () => {
        try {
            const token = window.appAPI.getToken();
            const data = await chatApiRequest('/api/chat', {
                method: 'GET',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            return Array.isArray(data) ? data : (data.messages || data.data || []);
        } catch (error) {
            console.error('❌ Load chat error:', error);
            throw error;
        }
    },
    
    /**
     * Cargar historial de chat - Endpoint: GET /api/chat/history
     */
    loadChatHistory: async () => {
        try {
            const token = window.appAPI.getToken();
            const data = await chatApiRequest('/api/chat/history', {
                method: 'GET',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            return Array.isArray(data) ? data : (data.messages || data.data || []);
        } catch (error) {
            console.error('❌ Load chat history error:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PERFIL DE USUARIO
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Configurar perfil de usuario - Endpoint: /api/user/setup
     * @param {Object} profileData - Datos del perfil (userId, newName, photo)
     * @returns {Promise<Object>} Datos del perfil actualizado
     */
    setupProfile: async (profileData) => {
        try {
            console.log('📤 Enviando datos al endpoint /api/user/setup:', profileData);
            
            // Validar que userId exista
            if (!profileData.userId) {
                throw new Error('ID de usuario requerido');
            }
            
            // Validar que newName exista
            if (!profileData.newName || profileData.newName.trim() === '') {
                throw new Error('Nombre requerido');
            }
            
            // Construir FormData para enviar archivos
            const formData = new FormData();
            formData.append('userId', profileData.userId);
            formData.append('newName', profileData.newName.trim());
            
            // La foto es opcional - solo añadir si existe
            if (profileData.photo && profileData.photo instanceof File) {
                formData.append('photo', profileData.photo);
                console.log('📷 Foto incluida en la solicitud');
            } else {
                console.log('📷 No se incluyó foto (es opcional)');
            }
            
            // Enviar al endpoint real
            const data = await apiRequest('/api/user/setup', {
                method: 'POST',
                body: formData
                // No incluir Content-Type para permitir que el navegador establezca el boundary
            });
            
            console.log('✅ Respuesta del servidor:', data);
            
            if (data.status === 'SUCCESS' || data.success) {
                // Actualizar sesión local con los datos del servidor
                const currentSession = window.appAPI.getSession() || {};
                const updatedSession = {
                    ...currentSession,
                    ...data.user,
                    display_name: data.user?.display_name || profileData.newName.trim(),
                    photo_url: data.user?.photo_url || null
                };
                
                window.appAPI.saveSession(updatedSession);
                console.log('✅ Sesión actualizada:', updatedSession);
                
                return {
                    status: 'SUCCESS',
                    success: true,
                    user: updatedSession
                };
            } else {
                throw new Error(data.error || data.message || 'Error al guardar perfil');
            }
            
        } catch (error) {
            console.error('Setup profile error:', error);
            throw error;
        }
    },

    /**
     * Configurar perfil de usuario - Versión alternativa con userId
     * @param {string} userId - ID del usuario
     * @param {string} newName - Nuevo nombre
     * @param {File} file - Archivo de foto (opcional)
     * @returns {Promise<Object>} Datos del perfil actualizado
     */
    setupProfile: async (userId, newName, file) => {
        const formData = new FormData();
        formData.append('userId', String(userId));    // Asegurar que sea texto puro
        formData.append('newName', newName);
        if (file) {
            formData.append('photo', file);
        }

        const response = await fetch(`https://basededatos.gokucomdohd.pro/api/user/setup`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detalles || `Error ${response.status}`);
        }
        return await response.json();
    },
    
    // ═══════════════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════════════
    
    isLoggedIn: () => {
        const user = window.appAPI.getSession();
        const token = window.appAPI.getToken();
        return !!(user && token);
    },
    
    logout: () => {
        window.appAPI.clearSession();
        window.location.href = 'index.html';
    }
};

// ═══════════════════════════════════════════════════════════════
// EXPONER AL CONTEXTO GLOBAL
// ═══════════════════════════════════════════════════════════════

window.API = API;
window.API_BASE = API_BASE;
window.CHAT_API_BASE = CHAT_API_BASE;

console.log('✅ Renderer cargado');
console.log('📡 API Base:', API_BASE);
console.log('💬 Chat API:', CHAT_API_BASE);

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN CENTRALIZADA DE SESIÓN
// ═══════════════════════════════════════════════════════════════

function checkAndRedirectSession() {
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        if (typeof API !== 'undefined' && API.isLoggedIn()) {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 300);
            return true;
        }
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

function initPage() {
    setTimeout(() => {
        if (!checkAndRedirectSession()) {
            console.log('✅ Página lista');
        }
    }, 50);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
