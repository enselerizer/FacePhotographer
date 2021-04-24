import { Injectable, NgZone } from '@angular/core';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';
import { BehaviorSubject } from 'rxjs';
import { SerialService } from './serial.service';
import { first, take } from 'rxjs/operators';
import { Router } from '@angular/router';
const electron = (<any>window).require('electron');

const protoData = {
  capturedImage: null,
  camerasList: [],
  portsList: [],
  institutes: [
    'ИИТ',
    'КИБ',
    'ИКБСП',
    'ИТХТ',
    'РТС',
    'ФТИ',
    'ИНТЕГУ/ИЭП'
  ],
  selectedInstitute: null,
  name: null,
  dirPath: null,
  webcamId: null
};
const protoStatus = {
  devicesReady: false,
  isInitDone: false
};


@Injectable({
  providedIn: 'root'
})
export class DataModelService {

  public data: BehaviorSubject<any> = new BehaviorSubject<any>(protoData);
  public status: BehaviorSubject<any> = new BehaviorSubject<any>(protoStatus);

  constructor(private serial: SerialService, private router: Router, private zone: NgZone) { }

  optainCapturedImage(img) {
    const newData = this.data.getValue();
    newData.capturedImage = img;
    this.data.next(newData);
  }

  selectDir() {
    return new Promise<void>((resolve, reject) => {
      this.serial.runDirSelector().then((dir) => {
        if(dir != undefined) {
          this.setDir(dir);
        } else {
          this.setDir(null);
        }
        resolve();
      });
    });
  }

  getCapturedImage(): WebcamImage {
    return this.data.getValue().capturedImage;
  }
  getDevicesReady() {
    return this.status.getValue().devicesReady;
  }
  getIsInitDone() {
    return this.status.getValue().isInitDone;
  }
  getInstitutes() {
    return this.data.getValue().institutes;
  }
  getSelectedInstitute() {
    if (this.data.getValue().selectedInstitute == null) {
      this.setSelectedInstitute(this.data.getValue().institutes[0]);
    }
    return this.data.getValue().selectedInstitute;
  }
  getName() {
    return this.data.getValue().name;
  }

  getDir() {
    return this.data.getValue().dirPath;
  }

  getWebcamId() {
    return this.data.getValue().webcamId;
  }

  setWebcamId(webcamId) {
    const newData = this.data.getValue();
    newData.webcamId = webcamId;
    this.data.next(newData);
  }

  setInstitutes(institutes) {
    const newData = this.data.getValue();
    newData.institutes = institutes;
    this.data.next(newData);
  }
  setSelectedInstitute(institute) {
    const newData = this.data.getValue();
    newData.selectedInstitute = institute;
    this.data.next(newData);
  } 
  setDir(dirPath) {
    const newData = this.data.getValue();
    console.log(dirPath);
    newData.dirPath = dirPath;
    this.data.next(newData);
  } 
  setName(name) {
    console.log(name);
    const newData = this.data.getValue();
    newData.name = name;
    this.data.next(newData);
  }


  setDevicesReady(devicesReady: boolean) {
    const newStatus = this.status.getValue();
    newStatus.devicesReady = devicesReady;
    this.status.next(newStatus);
  }

  setIsInitDone(isInitDone: boolean) {
    const newStatus = this.status.getValue();
    newStatus.isInitDone = isInitDone;
    this.status.next(newStatus);
  }

  setCamerasList(cameras) {
    const newData = this.data.getValue();
    newData.camerasList = cameras;
    this.data.next(newData);
  }
  setPortsList(ports) {
    const newData = this.data.getValue();
    newData.portsList = ports;
    this.data.next(newData);
  }


  async initDevices() {
    this.setIsInitDone(true);
    this.serial.serialStatus.subscribe((status) => {
      if (!status.isDeviceActive && this.getDevicesReady()) {
        this.setPortsList([]);
        this.setDevicesReady(false);
        this.initSerial();

      }
    });

    return new Promise<any>((resolve, reject) => {
      this.initCamera().then(wait(1000)).then((cameras) => {
        this.setCamerasList(cameras);
        this.serial.init().then((data) => {
          this.setPortsList([data.port]);
          this.setDevicesReady(true);
          resolve({ cameras, ports: data.port });
        });
      });
    });


  }

  async initCamera() {
    return new Promise<any>((resolve, reject) => {
      WebcamUtil.getAvailableVideoInputs()
        .then((mediaDevices: MediaDeviceInfo[]) => {
          resolve(mediaDevices.filter(dev => dev.kind == "videoinput"));
        });
    });
  }

  async initSerial() {
    return new Promise<any>((resolve, reject) => {
      this.serial.init().then((data) => {
        this.setPortsList([data.ports]);
        this.setDevicesReady(true);
        resolve({ ports: data.ports });
      });
    });
  }

  async getCode() {
    return new Promise<String>((resolve, reject) => {
      this.serial.sendReadyReq().then(() => {
        this.serial.waitCode().then((code) => {
          resolve(code);
        });
      });

    });
  }



  async saveImage(img) {
    return new Promise<void>((resolve, reject) => {
      this.serial.sendImageToSave(img, this.getDir(), ' '+this.getSelectedInstitute()+(this.getName() == null ? '' : '-'+this.getName())).then(() => {
        resolve();
      });
    });
  }


}

function wait(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}