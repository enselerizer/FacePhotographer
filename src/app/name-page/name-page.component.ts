import { Directive } from '@angular/core';
import { Input } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-name-page',
  templateUrl: './name-page.component.html',
  styleUrls: ['./name-page.component.css']
})
export class NamePageComponent implements OnInit {

  constructor(private router: Router, private dm: DataModelService) { }


  name;

  ngOnInit(): void {
    this.name = '';
  }

  next() {
    this.dm.setName(this.name == '' ? null : this.name);
    this.router.navigateByUrl('/code');
  }

}

