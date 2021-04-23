import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-code-page',
  templateUrl: './code-page.component.html',
  styleUrls: ['./code-page.component.css']
})
export class CodePageComponent implements OnInit {

  constructor(private dm: DataModelService, private cd: ChangeDetectorRef, private router: Router) { }

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

  enter() {
    this.router.navigateByUrl("/capture");
  }

  codeRep() {
    let res : String;
    let codeInt : String;
    let codeText : String;
    if(this.code == null) {
      res = "0000000000 000,00000";
    } else {
      codeInt = String(parseInt(this.code, 16)).padStart(10, "0");
      console.log(this.code.substr(0,2) + "   " + this.code.substr(2,4) );
      codeText = String(parseInt(this.code.substr(0,2), 16)).padStart(3, "0") + "," + String(parseInt(this.code.substr(2,4), 16)).padStart(5, "0");
      res = codeInt + " " + codeText;
    }
    return res;
  }
}
