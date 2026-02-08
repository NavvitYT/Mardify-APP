const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');

// Evitar error de chrome-sandbox en Linux
app.commandLine.appendSwitch('no-sandbox');

const CONFIG = {
    serverURL: 'https://basededatos.gokucomdohd.pro',
    appName: 'Mardify',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600
};

let mainWindow;
// FORZAMOS isDev a false si no estás usando React/Vite para que cargue el HTML local
let isDev = false; 

function createWindow() {
    mainWindow = new BrowserWindow({
        width: CONFIG.width,
        height: CONFIG.height,
        minWidth: CONFIG.minWidth,
        minHeight: CONFIG.minHeight,
        frame: false, 
        backgroundColor: '#0a0a0f',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false
    });

    // SOLUCIÓN AL ERR_CONNECTION_REFUSED:
    // Cargamos el archivo local directamente
    mainWindow.loadFile('pages/index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Las animaciones de opacidad se manejan mejor con CSS en el index.html
        // pero si quieres algo rápido en JS, usa esto:
        mainWindow.setOpacity(1); 
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ═══════════════════════════════════════════════════════════════
// ARREGLO DE LOS IPC (Quitamos los .animate que crashean)
// ═══════════════════════════════════════════════════════════════

ipcMain.handle('minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
        return false;
    } else {
        mainWindow?.maximize();
        return true;
    }
});

ipcMain.handle('close', () => {
    // Adiós al animate que daba error, cerramos directo
    app.quit();
});

ipcMain.handle('get-config', () => CONFIG);

// El resto de tus eventos está perfecto...
app.whenReady().then(createWindow);