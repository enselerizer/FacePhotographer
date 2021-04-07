import { Component, OnInit } from '@angular/core';
import { DataModelService } from 'dist/win-unpacked/resources/app/src/app/data-model.service';

@Component({
  selector: 'app-institute-page',
  templateUrl: './institute-page.component.html',
  styleUrls: ['./institute-page.component.css']
})
export class InstitutePageComponent implements OnInit {


  selectedInstitute;

  institutes = ['ИТ', 'КИБ']

  constructor(private dm: DataModelService) { }

  ngOnInit(): void {

  }





}
