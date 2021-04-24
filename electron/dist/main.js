"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var fs = require("fs");
var util = require("util");
var rimraf = require("rimraf");
var serial = require("serialport");
var Ready = require('@serialport/parser-ready');
var Readline = require('@serialport/parser-readline');
var dataUriToBuffer = require('data-uri-to-buffer');
var Stream = require('node-rtsp-stream');
var ffmpegPath = require('ffmpeg-static');
var sharp = require('sharp');
var ping = require('ping');
var win;
var stream;
var cameraHost = "192.168.1.200";
var tempFolder = __dirname + '\\temp';
var awUnlink = util.promisify(fs.unlink);
var awExists = util.promisify(fs.exists);
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < array.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callback(array[index], index, array)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
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
electron_1.app.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    var protocolName;
    return __generator(this, function (_a) {
        rimraf.sync(tempFolder);
        fs.mkdirSync(tempFolder);
        createWindow();
        protocolName = 'sfp';
        electron_1.protocol.registerFileProtocol(protocolName, function (request, callback) {
            var url = request.url.replace(protocolName + "://", '');
            try {
                return callback(decodeURIComponent(url));
            }
            catch (error) {
                console.error(error);
            }
        });
        return [2 /*return*/];
    });
}); });
electron_1.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
electron_1.app.on('window-all-closed', function () {
    rimraf.sync(tempFolder);
    electron_1.app.quit();
});
function createWindow() {
    var _this = this;
    win = new electron_1.BrowserWindow({
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
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../../dist/FacePhotographer/index.html"),
        protocol: 'file:',
        slashes: true,
    }));
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
    electron_1.ipcMain.on('serialGetList', function (event, arg) {
        getPortsList(function (data, data2) {
            win.webContents.send('serialGetListR', data2);
        });
    });
    electron_1.ipcMain.on('serialConnect', function (event, arg) {
        searchDevices();
    });
    electron_1.ipcMain.on('serialSendReadyReq', function (event, arg) {
        sendReadyReq();
        console.log("Sending READY request");
    });
    electron_1.ipcMain.on('sendImageToSave', function (event, arg) {
        sendImageToSave(arg);
    });
    electron_1.ipcMain.on('sendImageToSave', function (event, arg) {
        sendImageToSave(arg);
    });
    electron_1.ipcMain.on('openStream', function (event, arg) {
        openStream();
    });
    electron_1.ipcMain.on('closeStream', function (event, arg) {
        closeStream();
    });
    electron_1.ipcMain.on('selectDir', function (event, arg) { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, electron_1.dialog.showOpenDialog(win, {
                        properties: ['openDirectory']
                    })];
                case 1:
                    result = _a.sent();
                    win.webContents.send('selectDirR', result.filePaths);
                    return [2 /*return*/];
            }
        });
    }); });
    electron_1.ipcMain.on('pingCamera', function (event, arg) {
        pingCamera(arg);
    });
    electron_1.ipcMain.on('enableCamera', function (event, arg) {
        beginCameraKeepalive(cameraHost);
    });
}
var ports = [];
var portsSearcher;
var activePort;
function searchDevices() {
    ports.forEach(function (item) {
        if (item.isPortOpened) {
            item.portObject.close();
        }
    });
    ports = [];
    portsSearcher = null;
    activePort = null;
    console.log("START Pinging ports");
    portsSearcher = setInterval(function () {
        getPortsList(function () {
            ports.forEach(function (item, i) {
                openPort(i, function (port) {
                    win.webContents.send('serialConnectR', port);
                });
            });
        });
    }, 100);
}
function openPort(portIndex, callback) {
    if (!ports[portIndex].isPortOpened && !ports[portIndex].isPortOpening) {
        var portNum_1 = ports[portIndex].portDef.path;
        console.log("Ping port " + portNum_1);
        ports[portIndex].isPortOpening = true;
        ports[portIndex].portObject = new serial("\\\\.\\" + portNum_1, {
            baudRate: 115200
        }, function (err) {
            if (err) {
                console.log("Port " + portNum_1 + " failed to open! Error: " + err);
                ports[portIndex].isPortOpening = false;
            }
            else {
                ports[portIndex].isPortOpened = true;
                ports[portIndex].isPortOpening = false;
                ports[portIndex].portParserReady = ports[portIndex].portObject.pipe(new Ready({ delimiter: 'ready?' }));
                ports[portIndex].portParserReady.on('ready', function () {
                    console.log("Reader " + portNum_1 + " is here!");
                    activePort = ports[portIndex];
                    clearInterval(portsSearcher);
                    console.log("STOP Pinging ports");
                    beginKeepalive(activePort);
                    activePort.portParserLine = ports[portIndex].portObject.pipe(new Readline({ delimiter: '\n' }));
                    activePort.portParserLine.on('data', function (msg) {
                        activePort.isPortReady = true;
                        var res = msg.match(/\#([a-zA-Z\ 0-9\_\-\.]+)/);
                        if (res != null) {
                            callback({
                                sn: 'SN' + res[1],
                                port: activePort.portDef.path
                            });
                        }
                        msgEvent(activePort, msg);
                    });
                    ports[portIndex].portObject.write("hello\r");
                });
            }
        });
        ports[portIndex].portObject.on('close', function () {
            if (ports[portIndex] != undefined && ports[portIndex].isPortOpened != undefined) {
                ports[portIndex].isPortOpened = false;
                ports[portIndex].isPortOpening = false;
            }
        });
    }
    else {
        console.log("Skipping port " + ports[portIndex].portDef.path + " (" + (ports[portIndex].isPortOpened ? "opened" : "") + (ports[portIndex].isPortOpening ? "opening" : "") + ")");
    }
}
function getPortsList(callback) {
    serial.list().then(function (portsList) {
        var newPorts = [];
        portsList.forEach(function (item) {
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
        ports.forEach(function (item, index) {
            if (newPorts.filter(function (i) { return i.portDef.path == item.portDef.path; }).length == 0) {
                ports.splice(index, 1);
            }
        });
        newPorts.forEach(function (item) {
            if (ports.filter(function (i) { return i.portDef.path == item.portDef.path; }).length == 0) {
                ports.push(item);
            }
        });
        callback(null, portsList);
    });
}
;
function beginKeepalive(port) {
    if (port.isPortOpened) {
        port.keepaliveObject = setInterval(function () {
            port.portObject.write("keepalive\r");
            //console.log(new Date().toDateString() + "Checking if reader is still alive...");
            port.keepaliveTimer.push(setTimeout(function () {
                console.log("Reader not alive!");
                stopKeepalive(port);
                electron_1.app.relaunch();
                electron_1.app.exit();
            }, 6000));
        }, 500);
    }
}
function stopKeepalive(port) {
    port.keepaliveTimer.forEach(function (item) {
        clearTimeout(item);
    });
    clearInterval(port.keepaliveObject);
}
function msgEvent(port, msg) {
    console.log(new Date().toDateString() + JSON.stringify(msg));
    if (msg == "alive\r") {
        port.keepaliveTimer.forEach(function (item) {
            clearTimeout(item);
        });
        port.keepaliveTimer = [];
    }
    else if (msg == "OK\r") {
        clearInterval(activePort.readySender);
        win.webContents.send('serialSendReadyReqR');
    }
    else if (msg.match(/code-([0-9A-F]+)/) != null) {
        console.log(msg.match(/code-([0-9A-F]+)/));
        win.webContents.send('serialGotCode', msg.match(/code-([0-9A-F]+)/)[1]);
    }
}
function sendReadyReq() {
    activePort.portObject.write("ready\r");
    activePort.readySender = setInterval(function () {
        activePort.portObject.write("ready\r");
    }, 300);
}
function sendImageToSave(file) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, q, dir, changer, lastQ, cyclicBuffer, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buffer = dataUriToBuffer(file.img);
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
                    fs.writeFile("C://mirea-faces/output/originals/" + file.code + ".png", buffer, function (err) {
                        if (err)
                            return console.error(err);
                    });
                    if (file.cloudPath != null) {
                        fs.writeFile(file.cloudPath + "/mirea-faces/output/originals/" + file.code + ".png", buffer, function (err) {
                            if (err)
                                return console.error(err);
                        });
                    }
                    q = 100;
                    dir = false;
                    changer = 64;
                    lastQ = -100;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 5];
                    _loop_1 = function () {
                        var br;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    br = false;
                                    console.log("Currently trying q = " + q + ", dir " + dir + ", changer " + changer);
                                    return [4 /*yield*/, sharp(buffer)
                                            .resize({ width: 450, height: 600 })
                                            .jpeg({ mozjpeg: true, quality: q })
                                            .toBuffer({ resolveWithObject: true })
                                            .then(function (_a) {
                                            var data = _a.data, info = _a.info;
                                            if (dir ? (Buffer.byteLength(data.buffer) / 1024 < 50) : (Buffer.byteLength(data.buffer) / 1024 > 50)) {
                                                q = dir ? Math.max(Math.min(q + changer, 100), 1) : Math.max(Math.min(Math.floor(q - changer), 100), 1);
                                            }
                                            else {
                                                cyclicBuffer = data;
                                                br = true;
                                                changer = Math.ceil(changer / 2);
                                            }
                                        })];
                                case 1:
                                    _a.sent();
                                    if (br) {
                                        return [2 /*return*/, "break"];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    state_1 = _a.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 4];
                    return [3 /*break*/, 2];
                case 4:
                    if (Math.abs(q - lastQ) < 2) {
                        sharp(buffer)
                            .resize({ width: 450, height: 600 })
                            .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
                            .toBuffer({ resolveWithObject: true })
                            .then(function (_a) {
                            var data = _a.data, info = _a.info;
                            fs.writeFile("C://mirea-faces/output/compressed-450x600/" + file.code + ".jpg", data, function (err) {
                                if (err)
                                    return console.error(err);
                            });
                            sharp(buffer)
                                .resize({ width: 150, height: 200 })
                                .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
                                .toBuffer({ resolveWithObject: true })
                                .then(function (_a) {
                                var data = _a.data, info = _a.info;
                                fs.writeFile("C://mirea-faces/output/compressed-150x200/" + file.code + ".jpg", data, function (err) {
                                    if (err)
                                        return console.error(err);
                                });
                            });
                        });
                        if (file.cloudPath != null) {
                            sharp(buffer)
                                .resize({ width: 450, height: 600 })
                                .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
                                .toBuffer({ resolveWithObject: true })
                                .then(function (_a) {
                                var data = _a.data, info = _a.info;
                                fs.writeFile(file.cloudPath + "/mirea-faces/output/compressed-450x600/" + file.code + ".jpg", data, function (err) {
                                    if (err)
                                        return console.error(err);
                                });
                                sharp(buffer)
                                    .resize({ width: 150, height: 200 })
                                    .jpeg({ mozjpeg: true, quality: Math.max(q - 1, 1) })
                                    .toBuffer({ resolveWithObject: true })
                                    .then(function (_a) {
                                    var data = _a.data, info = _a.info;
                                    fs.writeFile(file.cloudPath + "/mirea-faces/output/compressed-150x200/" + file.code + ".jpg", data, function (err) {
                                        if (err)
                                            return console.error(err);
                                    });
                                });
                            });
                        }
                        return [3 /*break*/, 5];
                    }
                    else {
                        lastQ = q;
                        dir = !dir;
                    }
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function pingCamera(host) {
    ping.sys.probe(host, function (isAlive) {
        cameraHost = host;
        win.webContents.send('pingCameraR', isAlive);
    });
}
function beginCameraKeepalive(host) {
    setInterval(function () {
        ping.sys.probe(host, function (isAlive) {
            if (!isAlive) {
                electron_1.app.relaunch();
                electron_1.app.exit();
            }
        });
    }, 1000);
}
//# sourceMappingURL=main.js.map