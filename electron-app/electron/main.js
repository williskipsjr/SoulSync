const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  // In development, load from localhost:3000
  // In production, load from the built files
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../.next/server/app/index.html'));
  }

  // Prevent window from closing, minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Create a simple colored icon as placeholder
  const iconSize = 16;
  const canvas = require('canvas');
  const canvasInstance = canvas.createCanvas(iconSize, iconSize);
  const ctx = canvasInstance.getContext('2d');
  
  // Draw a simple circle icon
  ctx.fillStyle = '#4A90A4';
  ctx.beginPath();
  ctx.arc(iconSize / 2, iconSize / 2, iconSize / 2 - 2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Add a heart shape in the center
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♥', iconSize / 2, iconSize / 2);
  
  const icon = nativeImage.createFromDataURL(canvasInstance.toDataURL());
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show SoulSync',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  
  tray.setToolTip('SoulSync - Mental Health Companion');
  tray.setContextMenu(contextMenu);
  
  // Show window when tray icon is clicked
  tray.on('click', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on window close for macOS
  if (process.platform !== 'darwin') {
    // Still keep the app running in system tray
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
