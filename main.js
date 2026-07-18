const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({ name: 'launcher-config' });

let mainWindow = null;

function getAppUrl() {
  return store.get('appUrl') || null;
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function attachNavigationGuards(win, baseUrl) {
  let allowedHost = null;
  try { allowedHost = new URL(baseUrl).hostname; } catch { /* noop */ }

  // 新規ウィンドウ（target=_blank等）はシステムのブラウザで開く
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 設定したWebアプリと異なる「ホスト名」への遷移だけシステムのブラウザに委譲する。
  // http→https のリダイレクトやポート違いなど、同じサイト内の遷移まで
  // 誤って外部扱いしないよう、プロトコル/ポートは比較対象に含めない。
  win.webContents.on('will-navigate', (event, url) => {
    if (!allowedHost) return;
    try {
      const target = new URL(url);
      if (target.hostname !== allowedHost) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch { /* noop */ }
  });
}

function loadWebApp(win, url) {
  win.loadURL(url);
  attachNavigationGuards(win, url);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const url = getAppUrl();
  if (url) {
    loadWebApp(mainWindow, url);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'settings.html'));
  }

  buildMenu();
}

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'ファイル',
      submenu: [
        {
          label: '接続先URLを変更...',
          click: () => {
            mainWindow.loadFile(path.join(__dirname, 'renderer', 'settings.html'));
          }
        },
        {
          label: '再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const url = getAppUrl();
            if (url) loadWebApp(mainWindow, url);
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: '編集',
      submenu: [
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' },
        { role: 'selectAll', label: 'すべて選択' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { role: 'resetZoom', label: '実際のサイズ' },
        { role: 'zoomIn', label: '拡大' },
        { role: 'zoomOut', label: '縮小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'フルスクリーン切替' },
        { role: 'toggleDevTools', label: '開発者ツール' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------- 設定画面からのIPC ----------
ipcMain.handle('settings:get', () => ({ url: getAppUrl() }));

ipcMain.handle('settings:save', (_e, { url }) => {
  const trimmed = (url || '').trim().replace(/\/+$/, '');
  if (!isValidUrl(trimmed)) {
    return { ok: false, message: 'http:// または https:// で始まる正しいURLを入力してください' };
  }
  store.set('appUrl', trimmed);
  loadWebApp(mainWindow, trimmed);
  return { ok: true };
});
