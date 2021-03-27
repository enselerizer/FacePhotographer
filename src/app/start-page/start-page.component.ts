import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent implements OnInit {

  constructor(private dm: DataModelService, private router: Router) { }

  ngOnInit(): void {
    if(!this.dm.getSetupState()) {
      this.router.navigateByUrl('/setup');
    }
  }



}