import { Component, OnInit } from '@angular/core';
import { DataModelService } from '../data-model.service';

@Component({
  selector: 'app-institute-page',
  templateUrl: './institute-page.component.html',
  styleUrls: ['./institute-page.component.css']
})
export class InstitutePageComponent implements OnInit {


  selectedInstitute;

  institutes = ['ИТ', 'КИБ']

  data;

  constructor(private dm: DataModelService) { }

  ngOnInit(): void {
    this.institutes = this.dm.getInstitutes();
    this.selectedInstitute = this.dm.getSelectedInstitute();
  }

  changeInstitute() {
    this.dm.setSelectedInstitute(this.selectedInstitute);
  }





}
