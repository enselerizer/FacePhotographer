import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { DataModelService } from '../data-model.service';
import { CropperComponent } from 'angular-cropperjs';
import { Router } from '@angular/router';
import { StreamService } from '../stream.service';


@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit {

  constructor(private dm: DataModelService, private cd: ChangeDetectorRef, private router: Router, private streamer: StreamService) { }

  @ViewChild(CropperComponent) public angularCropper: CropperComponent;


  config = {
    aspectRatio: 3 / 4,
    preview: '.preview'
  }

  img;



  ngOnInit(): void {
    this.img = this.dm.getCapturedImage();
  }

  save() {
    const canvas = this.angularCropper.cropper.getCroppedCanvas();
    this.dm.saveImage(canvas.toDataURL("image/png"));
    if(this.dm.getWebcamId() == 'ipcam') {
      this.streamer.closeStream();
    }
    this.router.navigateByUrl("/start");
  }

  enter() {
    if(this.dm.getWebcamId() == 'ipcam') {
      this.streamer.openStream();
      this.router.navigateByUrl("/capture-ip");
    } else {
      this.router.navigateByUrl("/capture");
    }
  }

}
