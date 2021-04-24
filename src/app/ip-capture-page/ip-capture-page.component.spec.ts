import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpCapturePageComponent } from './ip-capture-page.component';

describe('IpCapturePageComponent', () => {
  let component: IpCapturePageComponent;
  let fixture: ComponentFixture<IpCapturePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpCapturePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpCapturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
