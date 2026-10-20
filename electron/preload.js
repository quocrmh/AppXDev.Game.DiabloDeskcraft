const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  setWindowMode: (mode) => ipcRenderer.send('desktop:set-window-mode', mode),
  setIgnoreMouse: (ignore) => ipcRenderer.send('desktop:set-ignore-mouse', ignore),
  setOpacity: (opacity) => ipcRenderer.send('desktop:set-opacity', opacity),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('desktop:toggle-always-on-top'),
  minimizeWindow: () => ipcRenderer.invoke('desktop:minimize'),
  quitApp: () => ipcRenderer.invoke('desktop:quit'),
});
