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
var win;
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
    win = new electron_1.BrowserWindow({
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
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../../dist/FacePhotographer/index.html"),
        protocol: 'file:',
        slashes: true,
    }));
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
    sendImageToSave;
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
                        var res = msg.match(/\#([0-9]+)/);
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
                keepaliveTimer: []
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
            //console.log("Checking if reader is still alive...");
            port.keepaliveTimer.push(setTimeout(function () {
                console.log("Reader not alive!");
                stopKeepalive(port);
                win.webContents.send('serialConnectionLost');
                //searchDevices();
            }, 4000));
        }, 1500);
    }
}
function stopKeepalive(port) {
    port.keepaliveTimer.forEach(function (item) {
        clearTimeout(item);
    });
    clearInterval(port.keepaliveObject);
}
function msgEvent(port, msg) {
    if (msg == "alive\r") {
        port.keepaliveTimer.forEach(function (item) {
            clearTimeout(item);
        });
        port.keepaliveTimer = [];
    }
    else if (msg == "OK\r") {
        win.webContents.send('serialSendReadyReqR');
    }
    else if (msg.match(/code-([0-9]+)/) != null) {
        console.log(msg.match(/code-([0-9]+)/));
        win.webContents.send('serialGotCode', msg.match(/code-([0-9]+)/)[1]);
    }
}
function sendReadyReq() {
    activePort.portObject.write("ready\r");
}
function sendImageToSave(file) {
    var buffer = dataUriToBuffer(file.img);
    fs.writeFile("C://mirea-faces/" + file.code + ".png", buffer, function (err) {
        if (err)
            return console.error(err);
    });
}
//# sourceMappingURL=main.js.map