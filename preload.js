const { contextBridge } = require('electron');

const soundPathArg = process.argv.find(arg => arg.startsWith('--soundPath='));
const soundPath = soundPathArg ? soundPathArg.replace('--soundPath=', '') : '';

contextBridge.exposeInMainWorld('gameConfig', {
  soundPath
});
