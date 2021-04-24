import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataModelService } from 'dist/win-unpacked/resources/app/src/app/data-model.service';
import { WebcamImage } from 'ngx-webcam';
import { StreamService } from '../stream.service';

declare var JSMpeg: any;

@Component({
  selector: 'app-ip-capture-page',
  templateUrl: './ip-capture-page.component.html',
  styleUrls: ['./ip-capture-page.component.css']
})
export class IpCapturePageComponent implements OnInit {

  constructor(private dm: DataModelService, private router: Router, private cd: ChangeDetectorRef, private streamer: StreamService) { }

  data;
  canvas;
  player;

  ngOnInit(): void {
    this.dm.data.subscribe((data) => {
      this.data = data;
      this.cd.detectChanges();
    });

    this.canvas = document.getElementById('video');
    this.player = new JSMpeg.Player('ws://localhost:9999/', { loop: true, canvas: this.canvas, autoplay: true, preserveDrawingBuffer: true, videoBufferSize : 2560*1440*10 });
  }
  public webcamImage: WebcamImage = null;

  handleImage() {
    this.dm.optainCapturedImage(this.canvas.toDataURL("image/png"));
    this.player.destroy();
    this.router.navigateByUrl('/edit');
  }

  enter() {
    this.player.destroy();
    this.router.navigateByUrl('/code');
  }

}
