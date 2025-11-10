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
  // Use the icon file or create a simple one
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    // Fallback: Create a simple tray icon from data URL
    const iconDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGHSURBVDiNpZLBaxNBFMZ/b3Y3yW42m7SxNqZpi1WhIIgH8eBBBA9ePHnw4sWTB/8DD/4DHjx48OBBEDx48ODBgyAePAiCBwVBRNCqVWut2TTZbHazOztjDqZpavvBg/fmm/d97w0jqsrJkQ8fPrC1tYXneSwvL7OxscHu7i4AExMTrK2t8fr1a+bm5uh2uxweHjI9Pc3t27dZXV1lfX2d7e1tZmZmWFlZYXFxkVarheu6LC0t4fs+uVyOIAhwHIft7W0cx2FxcZG5uTnK5TK5XI7FxUUqlQqFQoFKpcL8/DyZTIZsNsv9+/eZnJxkdnYW13VZWFggn89TLBYpFArkcjlyuRz5fJ5MJsPU1BS1Wo2xsTEqlQq+75PNZhkdHWVkZIR0Ok0qlSKZTJJMJkkkEiQSCeLxOLFYjGg0SjQaJRKJEIlECIfDhEIhwuEwoVAIy7IIBAJYloVlWViWhWVZWJaFaZqYpolpmpimSSAQwDAMDMPAMAyMMQYAY8w/jDH/A34DoZaHd1hCfG0AAAAASUVORK5CYII=';
    trayIcon = nativeImage.createFromDataURL(iconDataUrl);
  }
  
  tray = new Tray(trayIcon);
  
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
