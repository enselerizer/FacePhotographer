
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const electron = (<any>window).require('electron');

const protoSerialStatus = {
  isDeviceActive: false
};


@Injectable({
  providedIn: 'root'
})
export class SerialService {

  constructor(private zone: NgZone) { }

  public code: BehaviorSubject<String> = new BehaviorSubject<String>("");

  public serialStatus: BehaviorSubject<any> = new BehaviorSubject<any>(protoSerialStatus);


  codeRep(code: String) : String {
    return String(parseInt(this.getCode().substr(0,2), 16)).padStart(3, "0") + "," + String(parseInt(this.getCode().substr(2,4), 16)).padStart(5, "0");
  }

  async init() {
    
    electron.ipcRenderer.removeAllListeners('serialConnectionLost');


    electron.ipcRenderer.on('serialConnectionLost', (event, port) => {
      this.zone.run(() => {
        this.setIsDeviceActive(false);
      });
    });
    
    return new Promise<any>((resolve, reject) => {
      electron.ipcRenderer.once('serialConnectR', (event, port) => {
        this.zone.run(() => {
          this.setIsDeviceActive(true);
        });
        console.log(port);
        resolve({port});
        
      });
      electron.ipcRenderer.send('serialConnect');
    });
    
  }


  runDirSelector() {
    return new Promise<string>((resolve, reject) => {
      electron.ipcRenderer.once('selectDirR', (event, arg) => {
        resolve(arg[0]);
      });
      electron.ipcRenderer.send('selectDir');
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

  async sendImageToSave(img, cloudPath, postfix) {
    
    return new Promise<void>((resolve, reject) => {
      electron.ipcRenderer.once('sendImageToSaveR', (event, arg) => {
        resolve();
      });
      electron.ipcRenderer.send('sendImageToSave', {img, cloudPath, code: this.codeRep(this.getCode())+postfix});
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
  getCode() {
    return this.code.getValue();
  }

}
