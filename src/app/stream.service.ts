import { Injectable } from '@angular/core';
const electron = (<any>window).require('electron');

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  constructor() { }

  openStream() {
    electron.ipcRenderer.send('openStream');

  }

  closeStream() {
    electron.ipcRenderer.send('closeStream');

  }

  pingCamera(host) {
    return new Promise<boolean>((resolve, reject) => {
      electron.ipcRenderer.once('pingCameraR', (event, arg) => {
        resolve(arg);
      });
      electron.ipcRenderer.send('pingCamera', host);
    });
  }
  enableCamera() {
      electron.ipcRenderer.send('enableCamera');
  }

}
