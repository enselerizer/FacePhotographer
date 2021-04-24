import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as util from 'util';
import * as rimraf from 'rimraf';
import * as serial from 'serialport';

const Ready = require('@serialport/parser-ready')
const Readline = require('@serialport/parser-readline')
const dataUriToBuffer = require('data-uri-to-buffer');
const Stream = require('node-rtsp-stream');
const ffmpegPath = require('ffmpeg-static');
const sharp = require('sharp');
const ping = require('ping');

let win: BrowserWindow;
let stream;
let cameraHost = "192.168.1.200";

const tempFolder = __dirname + '\\temp';

const awUnlink = util.promisify(fs.unlink);
const awExists = util.promisify(fs.exists);

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


function openStream() {
  stream = new Stream({

    name: 'name',
    streamUrl: 'rtsp://admin:ADminium-12@192.168.1.200:554/ISAPI/Streaming/Channels/101',
    wsPort: 9999,
    ffmpegPath: ffmpegPath,
    ffmpegOptions: {
      '-b:v': '10000k'
    }

  });
}

function closeStream() {
  stream.stop();
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
    icon: path.join(__dirname, 'assets/icon.ico'),
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
  win.maximize();

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
  ipcMain.on('sendImageToSave', (event, arg) => {
    sendImageToSave(arg);
  });

  ipcMain.on('openStream', (event, arg) => {
    openStream();
  });
  ipcMain.on('closeStream', (event, arg) => {
    closeStream();
  });

  ipcMain.on('selectDir', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    win.webContents.send('selectDirR', result.filePaths);
  })


  ipcMain.on('pingCamera', (event, arg) => {
    pingCamera(arg);
  });

  ipcMain.on('enableCamera', (event, arg) => {
    beginCameraKeepalive(cameraHost);
  });
}


let ports = [];
let portsSearcher;
let activePort;


function searchDevices() {
  ports.forEach(item => {
    if (item.isPortOpened) {
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

            let res = msg.match(/\#([a-zA-Z\ 0-9\_\-\.]+)/);
            if (res != null) {
              callback({
                sn: 'SN' + res[1],
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
      if (ports[portIndex] != undefined && ports[portIndex].isPortOpened != undefined) {
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
        keepaliveTimer: [],
        readySender: null
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

      //console.log(new Date().toDateString() + "Checking if reader is still alive...");
      port.keepaliveTimer.push(setTimeout(() => {
        console.log("Reader not alive!");
        stopKeepalive(port);
        app.relaunch();
        app.exit();
      }, 6000));

    }, 500);
  }
}

function stopKeepalive(port) {
  port.keepaliveTimer.forEach(item => {
    clearTimeout(item);
  });
  clearInterval(port.keepaliveObject);
}

function msgEvent(port, msg) {
  console.log(new Date().toDateString() + JSON.stringify(msg));
  if (msg == "alive\r") {
    port.keepaliveTimer.forEach(item => {
      clearTimeout(item);
    });
    port.keepaliveTimer = [];
  } else if (msg == "OK\r") {
    clearInterval(activePort.readySender);
    win.webContents.send('serialSendReadyReqR');
  } else if (msg.match(/code-([0-9A-F]+)/) != null) {
    console.log(msg.match(/code-([0-9A-F]+)/));
    win.webContents.send('serialGotCode', msg.match(/code-([0-9A-F]+)/)[1]);
  }
}

function sendReadyReq() {
  activePort.portObject.write("ready\r");
  activePort.readySender = setInterval(() => {
    activePort.portObject.write("ready\r");
  }, 300);

}

async function sendImageToSave(file) {
  let buffer = dataUriToBuffer(file.img);

  //make sure that all dirs exist

  if (!fs.existsSync("C://mirea-faces/")) {
    fs.mkdirSync("C://mirea-faces/");
  }

  if (!fs.existsSync("C://mirea-faces/output/")) {
    fs.mkdirSync("C://mirea-faces/output/");
  }

  if (!fs.existsSync("C://mirea-faces/output/originals/")) {
    fs.mkdirSync("C://mirea-faces/output/originals/");
  }

  if (!fs.existsSync("C://mirea-faces/output/compressed-450x600/")) {
    fs.mkdirSync("C://mirea-faces/output/compressed-450x600/");
  }

  if (!fs.existsSync("C://mirea-faces/output/compressed-150x200/")) {
    fs.mkdirSync("C://mirea-faces/output/compressed-150x200/");
  }

  if (file.cloudPath != null) {
    if (!fs.existsSync(file.cloudPath + "/mirea-faces/")) {
      fs.mkdirSync(file.cloudPath + "/mirea-faces/");
    }

    if (!fs.existsSync(file.cloudPath + "/mirea-faces/output/")) {
      fs.mkdirSync(file.cloudPath + "/mirea-faces/output/");
    }

    if (!fs.existsSync(file.cloudPath + "/mirea-faces/output/originals/")) {
      fs.mkdirSync(file.cloudPath + "/mirea-faces/output/originals/");
    }

    if (!fs.existsSync(file.cloudPath + "/mirea-faces/output/compressed-450x600/")) {
      fs.mkdirSync(file.cloudPath + "/mirea-faces/output/compressed-450x600/");
    }

    if (!fs.existsSync(file.cloudPath + "/mirea-faces/output/compressed-150x200/")) {
      fs.mkdirSync(file.cloudPath + "/mirea-faces/output/compressed-150x200/");
    }
  }

  //save original

  fs.writeFile("C://mirea-faces/output/originals/" + file.code + ".png", buffer, (err) => {
    if (err) return console.error(err)
  });
  if (file.cloudPath != null) {
    fs.writeFile(file.cloudPath + "/mirea-faces/output/originals/" + file.code + ".png", buffer, (err) => {
      if (err) return console.error(err)
    });
  }

  // cyclic save compressed

  let q = 100;
  let dir = false;
  let changer = 64;
  let lastQ = -100;
  let cyclicBuffer;

  while (true) {
    while (true) {

      let br = false;
      console.log("Currently trying q = " + q + ", dir " + dir + ", changer " + changer);

      await sharp(buffer)
        .resize({ width: 450, height: 600 })
        .jpeg({ mozjpeg: true, quality: q })
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          if (dir ? (Buffer.byteLength(data.buffer) / 1024 < 50) : (Buffer.byteLength(data.buffer) / 1024 > 50)) {
            q = dir ? Math.max(Math.min(q + changer, 100), 1) : Math.max(Math.min(Math.floor(q - changer), 100), 1);
          } else {
            cyclicBuffer = data;
            br = true;
            changer = Math.ceil(changer / 2);
          }
        });
      if (br) {
        break;
      }
    }
    if (Math.abs(q - lastQ) < 2) {
      sharp(buffer)
        .resize({ width: 450, height: 600 })
        .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          fs.writeFile("C://mirea-faces/output/compressed-450x600/" + file.code + ".jpg", data, (err) => {
            if (err) return console.error(err)
          });
          sharp(buffer)
            .resize({ width: 150, height: 200 })
            .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) => {
              fs.writeFile("C://mirea-faces/output/compressed-150x200/" + file.code + ".jpg", data, (err) => {
                if (err) return console.error(err)
              });
            });
        });

      if (file.cloudPath != null) {
        sharp(buffer)
          .resize({ width: 450, height: 600 })
          .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
          .toBuffer({ resolveWithObject: true })
          .then(({ data, info }) => {
            fs.writeFile(file.cloudPath + "/mirea-faces/output/compressed-450x600/" + file.code + ".jpg", data, (err) => {
              if (err) return console.error(err)
            });
            sharp(buffer)
              .resize({ width: 150, height: 200 })
              .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
              .toBuffer({ resolveWithObject: true })
              .then(({ data, info }) => {
                fs.writeFile(file.cloudPath + "/mirea-faces/output/compressed-150x200/" + file.code + ".jpg", data, (err) => {
                  if (err) return console.error(err)
                });
              });
          });
      }
      break;
    } else {
      lastQ = q;
      dir = !dir;
    }
  }
}



function pingCamera(host) {
      ping.sys.probe(host, (isAlive) => {
        cameraHost = host;
        win.webContents.send('pingCameraR', isAlive);
      });
}

function beginCameraKeepalive(host) {

    setInterval(() => {

      ping.sys.probe(host, (isAlive) => {
        if(!isAlive) {
          app.relaunch();
          app.exit();
        } 
      });


    }, 1000);
  
}