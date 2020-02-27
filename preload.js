const electron = require('electron');

window.electron = electron;

window.dialog = electron.dialog;

// Expose node logic to front-end
window.ipcRenderer = electron.ipcRenderer;