import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { CameraStreamComponent } from '../camera-stream/camera-stream.component';
import { DataModelService } from '../data-model.service';

declare var JSMpeg: any;

@Component({
  selector: 'app-face-capture-page',
  templateUrl: './face-capture-page.component.html',
  styleUrls: ['./face-capture-page.component.css']
})
export class FaceCapturePageComponent implements OnInit {

  @ViewChild(CameraStreamComponent) stream: CameraStreamComponent;

  constructor(private dm: DataModelService, private router: Router, private cd: ChangeDetectorRef) { }

  data;

  ngOnInit(): void {
    this.dm.data.subscribe((data) => {
      this.data = data;
      this.cd.detectChanges();
    });
  }
  public webcamImage: WebcamImage = null;

  handleImage(webcamImage: WebcamImage) {
    this.dm.optainCapturedImage(webcamImage.imageAsDataUrl);
    this.router.navigateByUrl('/edit');
  }
  capture() {
    this.stream.triggerSnapshot();
  }
  switch() {
    this.stream.showNextWebcam(true);
  }

}
