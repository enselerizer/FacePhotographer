import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-code-page',
  templateUrl: './code-page.component.html',
  styleUrls: ['./code-page.component.css']
})
export class CodePageComponent implements OnInit {

  constructor(private dm: DataModelService, private cd: ChangeDetectorRef) { }

  code = null;
  loading = true;

 

  ngOnInit(): void {
    this.getCode();
    this.loading = true;
  }

  getCode() {
    this.dm.getCode().then((code) => {
      this.code = code;
      this.loading = false;
      this.cd.detectChanges();

    });
  }
  resetCode() {
    this.code = null;
    
    this.getCode();
    this.loading = true;
  }
}
