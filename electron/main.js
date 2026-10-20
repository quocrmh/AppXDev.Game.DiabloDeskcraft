const { app, BrowserWindow, ipcMain, screen, Tray, Menu, globalShortcut, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Enable GPU Hardware Acceleration for buttery-smooth 60 FPS Canvas rendering
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

const logFile = path.join(__dirname, '..', 'runtime_debug.log');
function writeDebugLog(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (_) {}
}

let mainWindow = null;
let tray = null;
let isAlwaysOnTop = true;
let currentMode = 'battle'; // 'battle' (220px) | 'expanded' (660px) | 'compact' (40px)

const HEIGHT_MAP = {
  compact: 40,
  battle: 220,
  expanded: 740,
};

function applyWindowMode(mode) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  currentMode = HEIGHT_MAP[mode] ? mode : 'battle';
  const targetHeight = HEIGHT_MAP[currentMode];
  const display = screen.getPrimaryDisplay();
  const wa = display.workArea;

  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setBounds({
    x: wa.x,
    y: wa.y + wa.height - targetHeight,
    width: wa.width,
    height: targetHeight,
  });
}

function createSystemTray() {
  try {
    const iconPath = path.join(__dirname, '..', 'assets', 'sprite_supply_cart.png');
    let icon = fs.existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
      : nativeImage.createEmpty();
    tray = new Tray(icon);
    tray.setToolTip('Tam Quốc Deskrawl: Vô Song Idle ARPG (Alt+Q để Ẩn/Hiện)');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Hiện / Ẩn Cửa Sổ (Alt+Q)',
        click: () => {
          if (!mainWindow || mainWindow.isDestroyed()) return;
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            applyWindowMode(currentMode);
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Chế Độ Chiến Trường (220px)',
        click: () => {
          if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
          applyWindowMode('battle');
        },
      },
      {
        label: 'Chế Độ Thu Gọn Thanh Đáy (40px)',
        click: () => {
          if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
          applyWindowMode('compact');
        },
      },
      {
        label: 'Mở Rộng Quân Doanh (660px)',
        click: () => {
          if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
          applyWindowMode('expanded');
        },
      },
      { type: 'separator' },
      {
        label: 'Thoát Tam Quốc Deskrawl',
        click: () => app.quit(),
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isVisible()) {
        applyWindowMode(currentMode === 'compact' ? 'battle' : 'compact');
      } else {
        mainWindow.show();
        applyWindowMode('battle');
      }
    });
  } catch (err) {
    writeDebugLog(`Tray init warning: ${err.message}`);
  }
}

function createBottomStripWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;
  const initHeight = HEIGHT_MAP.battle;

  mainWindow = new BrowserWindow({
    title: 'Tam Quốc Deskrawl: Vô Song Idle ARPG',
    x: workArea.x,
    y: workArea.y + workArea.height - initHeight,
    width: workArea.width,
    height: initHeight,
    show: true,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: '#0d0a08',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    writeDebugLog(`CONSOLE [${level}]: ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    writeDebugLog('HD Pixel Bottom Strip Window loaded!');
    applyWindowMode(currentMode);
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

  screen.on('display-metrics-changed', () => {
    applyWindowMode(currentMode);
  });
}

ipcMain.on('desktop:set-window-mode', (_event, mode) => {
  applyWindowMode(mode);
});

ipcMain.on('desktop:set-ignore-mouse', () => {});

ipcMain.on('desktop:set-opacity', (_event, opacity) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setOpacity(Math.max(0.25, Math.min(1.0, Number(opacity) || 1.0)));
});

ipcMain.handle('desktop:toggle-always-on-top', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  isAlwaysOnTop = !isAlwaysOnTop;
  mainWindow.setAlwaysOnTop(isAlwaysOnTop, isAlwaysOnTop ? 'screen-saver' : 'normal');
  return isAlwaysOnTop;
});

ipcMain.handle('desktop:minimize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.minimize();
});

ipcMain.handle('desktop:quit', () => {
  app.quit();
});

app.whenReady().then(() => {
  createBottomStripWindow();
  createSystemTray();
  try {
    globalShortcut.register('Alt+Q', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        applyWindowMode(currentMode);
      }
    });
  } catch (_) {}
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
