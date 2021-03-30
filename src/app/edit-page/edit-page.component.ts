import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { DataModelService } from '../data-model.service';
import { CropperComponent } from 'angular-cropperjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit {

  constructor(private dm: DataModelService, private cd: ChangeDetectorRef, private router: Router) { }

  @ViewChild(CropperComponent) public angularCropper: CropperComponent;


  config = {
    aspectRatio: 3 / 4,
    preview: '.preview'
  }

  img: WebcamImage;



  ngOnInit(): void {
    this.img = this.dm.getCapturedImage();
  }

  save() {
    const canvas = this.angularCropper.cropper.getCroppedCanvas(this.dm.getResolution());
    this.dm.saveImage(canvas.toDataURL("image/png"));
    this.router.navigateByUrl("/start");
  }

}
