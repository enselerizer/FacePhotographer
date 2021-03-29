import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { CameraStreamComponent } from '../camera-stream/camera-stream.component';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-face-capture-page',
  templateUrl: './face-capture-page.component.html',
  styleUrls: ['./face-capture-page.component.css']
})
export class FaceCapturePageComponent implements OnInit {

  @ViewChild(CameraStreamComponent) stream:CameraStreamComponent;

  constructor(private dm: DataModelService, private router: Router) { }

  ngOnInit(): void {
  }
  public webcamImage: WebcamImage = null;

  handleImage(webcamImage: WebcamImage) {
    this.dm.optainCapturedImage(webcamImage);
    this.router.navigateByUrl('/edit');
  }
  capture() {
    this.stream.triggerSnapshot();
  }
  switch() {
    this.stream.showNextWebcam(true);
  }

}
