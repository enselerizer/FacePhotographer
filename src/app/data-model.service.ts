import { Injectable } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { BehaviorSubject } from 'rxjs';

const protoData = {
  capturedImage: null
};
const protoStatus = {
  setupDone: false
};


@Injectable({
  providedIn: 'root'
})
export class DataModelService {

  public data: BehaviorSubject<any> = new BehaviorSubject<any>(protoData);
  public status: BehaviorSubject<any> = new BehaviorSubject<any>(protoStatus);

  constructor() { }

  optainCapturedImage(img) {
    const newData = Object.create(protoData);
    newData.capturedImage = img;
    this.data.next(newData);
  }

  getCapturedImage(): WebcamImage {
    return this.data.getValue().capturedImage;
  }

  getSetupState(): boolean {
    return this.status.getValue().setupDone;
  }

  setSetupState(setupDone: boolean) {
    const newStatus = Object.create(protoStatus);
    newStatus.setupDone = setupDone;
    this.status.next(newStatus);
  }
}
