import { Component, OnInit } from '@angular/core';
import { WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-setup-page',
  templateUrl: './setup-page.component.html',
  styleUrls: ['./setup-page.component.css']
})
export class SetupPageComponent implements OnInit {

  constructor() { }

  testsList: any[] = [
    { label: 'Поиск камеры...', value: true, icon: 'camera_enhance' },
    { label: 'Поиск RFID считывателя...', value: true, icon: 'surround_sound' },
  ];

  filter_mediaVideoDevices(dev) {
    return dev.kind == "videoinput";
  }


  ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        let mediaVideoDevices: Array<any> = mediaDevices.filter(this.filter_mediaVideoDevices);
        if(mediaVideoDevices.length > 0) {
          this.testsList[0].value = false;
          this.testsList[0].label ='Камера найдена: '+mediaVideoDevices[0].label;
        }

      });
  }

}
