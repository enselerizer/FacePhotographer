import { ChangeDetectorRef, Component } from '@angular/core';
import { DataModelService } from './data-model.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private dm: DataModelService, private _snackBar: MatSnackBar, private cd: ChangeDetectorRef) {};

  title = 'FacePhotographer';

  
}
