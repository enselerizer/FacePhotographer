import { Component, OnInit } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit {

  constructor(private dm: DataModelService) { }

  img: WebcamImage;

  ngOnInit(): void {
    this.img = this.dm.getCapturedImage();
  }

}
