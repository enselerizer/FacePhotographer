import { Injectable } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { BehaviorSubject } from 'rxjs';

const protoData = {
  capturedImage: null
};


@Injectable({
  providedIn: 'root'
})
export class DataModelService {

  public data: BehaviorSubject<any> = new BehaviorSubject<any>(protoData);

  constructor() { }

  optainCapturedImage(img) {
    const newData = Object.create(protoData);
    newData.capturedImage = img;
    this.data.next(newData);
  }

  getCapturedImage(): WebcamImage {
    return this.data.getValue().capturedImage;
  }
}
