import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent implements OnInit {

  constructor(private dm: DataModelService, private router: Router, private zone: NgZone, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  enter() {
    this.router.navigateByUrl("/name");
  }



}