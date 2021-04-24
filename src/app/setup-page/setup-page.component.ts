import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataModelService } from '../data-model.service';
import { StreamService } from '../stream.service';

const CCTV_ICON = `
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
<path fill="currentColor" d="M18.15,4.94C17.77,4.91 17.37,5 17,5.2L8.35,10.2C7.39,10.76 7.07,12 7.62,12.94L9.12,15.53C9.67,16.5 10.89,16.82 11.85,16.27L13.65,15.23C13.92,15.69 14.32,16.06 14.81,16.27V18.04C14.81,19.13 15.7,20 16.81,20H22V18.04H16.81V16.27C17.72,15.87 18.31,14.97 18.31,14C18.31,13.54 18.19,13.11 17.97,12.73L20.5,11.27C21.47,10.71 21.8,9.5 21.24,8.53L19.74,5.94C19.4,5.34 18.79,5 18.15,4.94M6.22,13.17L2,13.87L2.75,15.17L4.75,18.63L5.5,19.93L8.22,16.63L6.22,13.17Z" />
</svg>
`;

function wait(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

@Component({
  selector: 'app-setup-page',
  templateUrl: './setup-page.component.html',
  styleUrls: ['./setup-page.component.css']
})
export class SetupPageComponent implements OnInit {



  cloudCopy = false;
  cloudCopyPending = false;

  
  constructor(private dm: DataModelService, private cd: ChangeDetectorRef, private _snackBar: MatSnackBar, private router: Router, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private streamer: StreamService) {
    iconRegistry.addSvgIconLiteral('ipcam', sanitizer.bypassSecurityTrustHtml(CCTV_ICON));
   }

  cameraUI: any[] = [
    { label: 'Поиск камеры...', sublabel: '', value: true, icon: 'camera_enhance' },
  ];

  serialUI: any[] = [
    { label: 'Поиск RFID считывателя...', sublabel: '', value: true, icon: 'surround_sound' },
  ];

  filter_mediaVideoDevices(dev) {
    return dev.kind == "videoinput";
  }

  data;
  status;
  lastValue;
  cameraAvailable;
  cameraPending = false;


  pingCamera() {
    this.cameraPending = true;
    this.streamer.pingCamera("192.168.1.200").then(wait(1000)).then((res) => {
      this.cameraAvailable = res;
      this.cameraPending = false;
      this.cd.detectChanges();
    });
  }
  
  ngOnInit(): void {

    this.pingCamera();

    this.dm.status.subscribe((status) => {
      this.status = status;
      // if (!status.devicesReady) {
      //   this._snackBar.open('RFID считыватель потерян!', 'Ок', {
      //     duration: 500,
      //     horizontalPosition: 'right',
      //     verticalPosition: 'top'
      //   });
      // }
      this.cd.detectChanges();
    });

    this.dm.data.subscribe((data) => {
      console.log(JSON.parse(JSON.stringify(data)));
      this.data = data;
      if (data.camerasList.length > 0) {
        this.cameraUI = [];
        data.camerasList.forEach((element, index) => {
          this.cameraUI.push({ label: 'Web-камера', sublabel: element.label, value: false, icon: 'camera_enhance', deviceId: element.deviceId })
        });
        
      } else {
        this.cameraUI = [];
        this.cameraUI.push({ label: 'Поиск камер...', sublabel: '', value: true, icon: 'camera_enhance' })
      }
      if (data.portsList.length > 0) {
        this.serialUI[0].value = false;
        this.serialUI[0].label = 'RFID считыватель';
        console.log(JSON.stringify(data));
        this.serialUI[0].sublabel = 'Порт ' + data.portsList[0].port + ', серийный номер: ' + data.portsList[0].sn;
      } else {
        this.serialUI[0].value = true;
        this.serialUI[0].label = 'Поиск RFID считывателя...';
        this.serialUI[0].sublabel = '';
      }
      this.cd.detectChanges();
    });

    if(!this.dm.getIsInitDone()) {
      this.dm.initDevices();
    }
    

  }



  enter() {
    if(this.dm.getWebcamId() == 'ipcam') {
      this.streamer.enableCamera();
    }
    this.router.navigateByUrl("/institute");
  }

  setWebcam(webcamId) {
    this.dm.setWebcamId(webcamId);
    console.log(webcamId);
  }

  async selectDir() {
    this.cloudCopyPending = true;
    let res = await this.dm.selectDir();
    this.cloudCopyPending = false;
  }

  toggle() {
    if(!this.cloudCopy) {
      this.dm.setDir(null);
    }
  }

  getDirPath() {
    return this.dm.getDir();
  }

}
