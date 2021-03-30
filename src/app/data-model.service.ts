import { Injectable, NgZone } from '@angular/core';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';
import { BehaviorSubject } from 'rxjs';
import { SerialService } from './serial.service';
import { first, take } from 'rxjs/operators';
import { Router } from '@angular/router';

const protoData = {
  capturedImage: null,
  camerasList: [],
  portsList: [],
  resolution: {
    width: 600,
    height: 800
  }
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
    const newData = Object.create(protoData);
    newData.capturedImage = img;
    this.data.next(newData);
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
  getResolution() {
    return this.data.getValue().resolution;
  }
  setResolution(width, height) {
    const newData = this.data.getValue();
    newData.resolution = {width, height};
    this.data.next(newData);
    this.serial.writeResolution(height);
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
          this.setResolution(data.height/4*3, data.height);
          this.setPortsList([data.ports]);
          this.setDevicesReady(true);
          resolve({ cameras, ports: data.ports });
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
        resolve({ ports:data.ports });
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
      this.serial.sendImageToSave(img).then(() => {
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