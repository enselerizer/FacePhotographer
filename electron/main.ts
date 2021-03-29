import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as util from 'util';
import * as rimraf from 'rimraf';
import * as serial from 'serialport';

const Ready = require('@serialport/parser-ready')
const Readline = require('@serialport/parser-readline')

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
      contextIsolation: false
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

  win.webContents.openDevTools();

  // win.on('closed', () => {
  //   win = null;
  // });

  // win.on('maximize', () => {
  //   win.webContents.send('windowStatusChanged', true);
  // });
  // win.on('unmaximize', () => {
  //   win.webContents.send('windowStatusChanged', false);
  // });

  ipcMain.on('serialGetList', (event, arg) => {
    getPortsList((data, data2) => {
      win.webContents.send('serialGetListR', data2);
    });

  });

  ipcMain.on('serialConnect', (event, arg) => {
    searchDevices();
  });

  ipcMain.on('serialSendReadyReq', (event, arg) => {
    sendReadyReq();
    console.log("Sending READY request")
  });
  ipcMain.on('sendImageToSave', (event, arg) => {
    sendImageToSave(arg);
  });

  sendImageToSave
}


let ports = [];
let portsSearcher;
let activePort;


function searchDevices() {
  ports.forEach(item => {
    if(item.isPortOpened) {
      item.portObject.close();
    }
  });
  ports = [];
  portsSearcher = null;
  activePort = null;
  console.log("START Pinging ports");
  portsSearcher = setInterval(() => {
    
    getPortsList(() => {
      ports.forEach((item, i) => {
        openPort(i, (port) => {
          win.webContents.send('serialConnectR', port);
        });

      });
    });
  }, 100);
}



function openPort(portIndex, callback) {
  if (!ports[portIndex].isPortOpened && !ports[portIndex].isPortOpening) {
    let portNum = ports[portIndex].portDef.path;
    console.log("Ping port " + portNum);
    ports[portIndex].isPortOpening = true;
    ports[portIndex].portObject = new serial("\\\\.\\" + portNum, {
      baudRate: 115200
    }, (err) => {
      if (err) {
        console.log("Port " + portNum + " failed to open! Error: " + err);
        ports[portIndex].isPortOpening = false;
      } else {
        ports[portIndex].isPortOpened = true;
        ports[portIndex].isPortOpening = false;
        ports[portIndex].portParserReady = ports[portIndex].portObject.pipe(new Ready({ delimiter: 'ready?' }))
        ports[portIndex].portParserReady.on('ready', () => {
          console.log("Reader " + portNum + " is here!");
          activePort = ports[portIndex];
          clearInterval(portsSearcher);
          console.log("STOP Pinging ports");
          beginKeepalive(activePort);

          activePort.portParserLine = ports[portIndex].portObject.pipe(new Readline({ delimiter: '\n' }))
          activePort.portParserLine.on('data', (msg) => {
            activePort.isPortReady = true;
            
            let res = msg.match(/\#([0-9]+)/);
            if(res != null) {
              callback({
                sn: 'SN'+res[1],
                port: activePort.portDef.path
              });
            }
            
           
            msgEvent(activePort, msg);
          })

          ports[portIndex].portObject.write("hello\r");

        });

      }
    });
    ports[portIndex].portObject.on('close', () => {
      if(ports[portIndex] != undefined && ports[portIndex].isPortOpened != undefined) {
        ports[portIndex].isPortOpened = false;
        ports[portIndex].isPortOpening = false;
      }
      
    });
  } else {
    console.log("Skipping port " + ports[portIndex].portDef.path + " (" + (ports[portIndex].isPortOpened ? "opened" : "") + (ports[portIndex].isPortOpening ? "opening" : "") + ")");
  }

}


function getPortsList(callback) {

  serial.list().then((portsList) => {
    let newPorts = [];
    portsList.forEach(item => {
      newPorts.push({
        portDef: item,
        portObject: null,
        portParserReady: null,
        portParserLine: null,
        isPortOpened: false,
        isPortOpening: false,
        isPortReady: false,
        pingObject: null,
        keepaliveObject: null,
        keepaliveTimer: []
      });
    });

    ports.forEach((item, index) => {
      if (newPorts.filter(i => i.portDef.path == item.portDef.path).length == 0) {
        ports.splice(index, 1);
      }
    });

    newPorts.forEach(item => {
      if (ports.filter(i => i.portDef.path == item.portDef.path).length == 0) {
        ports.push(item);
      }
    });

    callback(null, portsList);
  });
};

function beginKeepalive(port) {
  if (port.isPortOpened) {
    port.keepaliveObject = setInterval(() => {

      port.portObject.write("keepalive\r");
      //console.log("Checking if reader is still alive...");
      port.keepaliveTimer.push(setTimeout(() => {
        console.log("Reader not alive!");
        stopKeepalive(port);
        win.webContents.send('serialConnectionLost');
        //searchDevices();
      }, 4000));

    }, 1500);
  }
}

function stopKeepalive(port) {
  port.keepaliveTimer.forEach(item => {
    clearTimeout(item);
  });
  clearInterval(port.keepaliveObject);
}

function msgEvent(port, msg) {
  if(msg == "alive\r") {
    port.keepaliveTimer.forEach(item => {
      clearTimeout(item);
    });
    port.keepaliveTimer = [];
  } else if(msg == "OK\r") {
    win.webContents.send('serialSendReadyReqR');
  } else if(msg.match(/code-([0-9]+)/) != null) {
    console.log(msg.match(/code-([0-9]+)/));
    win.webContents.send('serialGotCode', msg.match(/code-([0-9]+)/)[1]);
  }
}

function sendReadyReq() {
  activePort.portObject.write("ready\r");
}

function sendImageToSave(img) {
  console.log(img);
}