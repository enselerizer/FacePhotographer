
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const electron = (<any>window).require('electron');

const protoSerialStatus = {
  isDeviceActive: false
};


@Injectable({
  providedIn: 'root'
})
export class SerialService {

  constructor() { }

  public code: BehaviorSubject<String> = new BehaviorSubject<String>("");

  public serialStatus: BehaviorSubject<any> = new BehaviorSubject<any>(protoSerialStatus);

  async init() {
    
    electron.ipcRenderer.removeAllListeners('serialConnectionLost');


    electron.ipcRenderer.on('serialConnectionLost', (event, port) => {
      this.setIsDeviceActive(false);
    });
    
    return new Promise<any>((resolve, reject) => {
      electron.ipcRenderer.once('serialConnectR', (event, port) => {
        console.log(port);
        this.setIsDeviceActive(true);
        resolve(port);
      });
      electron.ipcRenderer.send('serialConnect');
    });
    
  }

  async sendReadyReq() {
    
    return new Promise<void>((resolve, reject) => {
      electron.ipcRenderer.once('serialSendReadyReqR', (event, arg) => {
        resolve();
      });
      electron.ipcRenderer.send('serialSendReadyReq');
    });
  }

  async sendImageToSave(img) {
    
    return new Promise<void>((resolve, reject) => {
      electron.ipcRenderer.once('sendImageToSaveR', (event, arg) => {
        resolve();
      });
      electron.ipcRenderer.send('sendImageToSave', img);
    });
  }

  async waitCode() {
    
    return new Promise<String>((resolve, reject) => {
      electron.ipcRenderer.on('serialGotCode', (event, code) => {
        this.setCode(code);
        resolve(code);
      });
    });
  }


  setIsDeviceActive(newv) {
    const newSerialStatus = this.serialStatus.getValue();
    newSerialStatus.isDeviceActive = newv;
    this.serialStatus.next(newSerialStatus);
  }

  setCode(code) {
    this.code.next(code);
  }

}
