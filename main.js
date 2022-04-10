const { app, BrowserWindow } = require('electron');
require('electron-reload')(__dirname);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    win.webContents.openDevTools();
    win.loadFile('src/index.html');
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.plataform !== 'darwin') app.quit();
});
