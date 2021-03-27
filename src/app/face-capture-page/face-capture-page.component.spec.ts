import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceCapturePageComponent } from './face-capture-page.component';

describe('FaceCapturePageComponent', () => {
  let component: FaceCapturePageComponent;
  let fixture: ComponentFixture<FaceCapturePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceCapturePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceCapturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
