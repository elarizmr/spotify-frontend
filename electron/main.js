const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let nextProcess;
let mainWindow;

async function startNextServer() {
  nextProcess = spawn('node', ['.next/standalone/server.js'], {
    env: { ...process.env, PORT: '3000' },
    cwd: path.join(__dirname, '..'),
  });

  nextProcess.stdout.on('data', (data) => console.log(`Next: ${data}`));
  nextProcess.stderr.on('data', (data) => console.error(`Next Error: ${data}`));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#121212',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  await waitOn({ resources: ['http://localhost:3000'] });
  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(async () => {
 
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());

  await startNextServer();
  await createWindow();
});

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});