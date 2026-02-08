// ╔══════════════════════════════════════════════════════════════╗
// ║              MARDIFY APP - PRELOAD SCRIPT                      ║
// ║        Comunicación segura entre procesos                      ║
// ╚══════════════════════════════════════════════════════════════╝

const { contextBridge, ipcRenderer } = require('electron');

// ═══════════════════════════════════════════════════════════════
// EXPOSICIÓN SEGURA DE APIs AL RENDERIZADOR
// ═══════════════════════════════════════════════════════════════

contextBridge.exposeInMainWorld('electronAPI', {
    // ═══════════════════════════════════════════════════════════════
    // CONTROL DE VENTANA
    // ═══════════════════════════════════════════════════════════════
    
    minimize: () => ipcRenderer.invoke('minimize'),
    maximize: () => ipcRenderer.invoke('maximize'),
    close: () => ipcRenderer.invoke('close'),
    isMaximized: () => ipcRenderer.invoke('maximize').then(() => true).catch(() => false),
    
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURACIÓN
    // ═══════════════════════════════════════════════════════════════
    
    getConfig: () => ipcRenderer.invoke('get-config'),
    
    // ═══════════════════════════════════════════════════════════════
    // NOTIFICACIONES Y DIÁLOGOS
    // ═══════════════════════════════════════════════════════════════
    
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
    selectFile: (options) => ipcRenderer.invoke('select-file', options),
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTOS DE VENTANA (para detectar cambios de estado)
    // ═══════════════════════════════════════════════════════════════
    
    onWindowMaximize: (callback) => {
        ipcRenderer.on('window-maximize', callback);
    },
    
    onWindowUnmaximize: (callback) => {
        ipcRenderer.on('window-unmaximize', callback);
    },
    
    removeListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
    
    // ═══════════════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════════════
    
    platform: process.platform,
    isDev: !process.env.npm_package_json &&
           !require('electron').app.isPackaged
});

// ═══════════════════════════════════════════════════════════════
// STORAGE BRIDGE (Comunicación con localStorage del sistema)
// ═══════════════════════════════════════════════════════════════

contextBridge.exposeInMainWorld('storageAPI', {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            return false;
        }
    }
});

// ═══════════════════════════════════════════════════════════════
// API DE APLICACIÓN (Funcionalidad específica)
// ═══════════════════════════════════════════════════════════════

contextBridge.exposeInMainWorld('appAPI', {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURACIÓN DE SERVIDOR
    // ═══════════════════════════════════════════════════════════════
    
    getServerURL: () => 'https://basededatos.gokucomdohd.pro',
    
    // ═══════════════════════════════════════════════════════════════
    // ENDPOINTS DE API
    // ═══════════════════════════════════════════════════════════════
    
    endpoints: {
        login: '/api/login',
        register: '/api/register',
        users: '/api/user/',
        profile: '/api/user/profile',
        update: '/api/user/update'
    },
    
    // ═══════════════════════════════════════════════════════════════
    // UTILIDADES DE SESIÓN
    // ═══════════════════════════════════════════════════════════════
    
    saveSession: (userData) => {
        try {
            localStorage.setItem('mardify_user', JSON.stringify(userData));
            return true;
        } catch (e) {
            return false;
        }
    },
    
    getSession: () => {
        try {
            const user = localStorage.getItem('mardify_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },
    
    clearSession: () => {
        localStorage.removeItem('mardify_user');
        localStorage.removeItem('mardify_token');
    },
    
    saveToken: (token) => {
        try {
            localStorage.setItem('mardify_token', token);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    getToken: () => {
        return localStorage.getItem('mardify_token');
    },

    saveAppState: (stateJson) => {
        try {
            localStorage.setItem('mardify_app_state', stateJson);
            return true;
        } catch (e) {
            return false;
        }
    },

    getAppState: () => {
        try {
            return localStorage.getItem('mardify_app_state');
        } catch (e) {
            return null;
        }
    }
});

console.log('✅ Preload script cargado correctamente');

