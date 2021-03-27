import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as util from 'util';
import * as rimraf from 'rimraf';

let win: BrowserWindow;

const tempFolder = __dirname + '\\temp';

const awUnlink = util.promisify(fs.unlink);
const awExists = util.promisify(fs.exists);

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

app.on('ready', async () => {
  rimraf.sync(tempFolder);
  fs.mkdirSync(tempFolder);
  createWindow();
  const protocolName = 'sfp';

  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '');
    try {
      return callback(decodeURIComponent(url));
    } catch (error) {
      console.error(error);
    }
  });
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  rimraf.sync(tempFolder);
  app.quit();
});

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 640,
    minWidth: 640,
    minHeight: 480,
    //frame: false,
    backgroundColor: '#242424',
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.removeMenu();

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `../../dist/FacePhotographer/index.html`),
      protocol: 'file:',
      slashes: true,
    })
  );

  //win.webContents.openDevTools();

  // win.on('closed', () => {
  //   win = null;
  // });

  // win.on('maximize', () => {
  //   win.webContents.send('windowStatusChanged', true);
  // });
  // win.on('unmaximize', () => {
  //   win.webContents.send('windowStatusChanged', false);
  // });
}

