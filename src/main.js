const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const db = require('./database/db');

const getResourcePath = (relativePath) => {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, relativePath);
    }
    return path.join(__dirname, '..', relativePath);
};

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: getResourcePath('resources/icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
    
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// Обработчики данных партнеров
ipcMain.handle('get-partners', async () => {
    try {
        return await db.getPartners();
    } catch (error) {
        console.error('Error in IPC handler get-partners:', error);
        throw error;
    }
});

ipcMain.handle('add-partner', async (event, partnerData) => {
    try {
        return await db.addPartner(partnerData);
    } catch (error) {
        console.error('Error in IPC handler add-partner:', error);
        throw error;
    }
});

ipcMain.handle('update-partner', async (event, { id, partnerData }) => {
    try {
        return await db.updatePartner(id, partnerData);
    } catch (error) {
        console.error('Error in IPC handler update-partner:', error);
        throw error;
    }
});

ipcMain.handle('delete-partner', async (event, partnerId) => {
    try {
        return await db.deletePartner(partnerId);
    } catch (error) {
        console.error('Error in IPC handler delete-partner:', error);
        throw error;
    }
});

ipcMain.handle('get-partner-by-id', async (event, partnerId) => {
    try {
        return await db.getPartnerById(partnerId);
    } catch (error) {
        console.error('Error in IPC handler get-partner-by-id:', error);
        throw error;
    }
});

// Обработчики диалоговых окон
ipcMain.handle('show-error-box', (event, { title, message }) => {
    dialog.showErrorBox(title, message);
});

ipcMain.handle('show-info-box', async (event, { title, message }) => {
    await dialog.showMessageBox({
        type: 'info',
        title: title,
        message: message,
        buttons: ['ОК']
    });
});

ipcMain.handle('show-warning-box', async (event, { title, message }) => {
     await dialog.showMessageBox({
        type: 'warning',
        title: title,
        message: message,
        buttons: ['ОК']
    });
});

ipcMain.handle('show-question-box', async (event, { title, message, buttons }) => {
    const { response } = await dialog.showMessageBox({
        type: 'question',
        title: title,
        message: message,
        buttons: buttons
    });
    return response;
});

ipcMain.handle('set-window-title', (event, title) => {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents);
    if (window) {
        window.setTitle(title);
    }
});

// Обработчики жизненного цикла приложения
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        db.close();
        app.quit();
    }
});

app.on('before-quit', () => {
    if (process.platform === 'darwin') {
        db.close();
    }
}); 