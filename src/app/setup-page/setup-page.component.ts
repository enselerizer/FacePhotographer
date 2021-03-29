import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-setup-page',
  templateUrl: './setup-page.component.html',
  styleUrls: ['./setup-page.component.css']
})
export class SetupPageComponent implements OnInit {

  constructor(private dm: DataModelService, private cd: ChangeDetectorRef, private _snackBar: MatSnackBar) { }

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

  ngOnInit(): void {
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
          this.cameraUI.push({ label: 'Камера найдена!', sublabel: element.label, value: false, icon: 'camera_enhance' })
        });
        
      } else {
        this.cameraUI = [];
        this.cameraUI.push({ label: 'Поиск камеры...', sublabel: '', value: true, icon: 'camera_enhance' })
      }
      if (data.portsList.length > 0) {
        this.serialUI[0].value = false;
        this.serialUI[0].label = 'Считыватель найден!';
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
}
