import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StartPageComponent } from './start-page/start-page.component';
import { RouterModule, Routes } from '@angular/router';
import { CameraStreamComponent } from './camera-stream/camera-stream.component';
import { WebcamModule } from 'ngx-webcam';
import { FaceCapturePageComponent } from './face-capture-page/face-capture-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';

const appRoutes: Routes = [
  { path: '', component: StartPageComponent},
  { path: 'capture', component: FaceCapturePageComponent},
  { path: 'edit', component: EditPageComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    StartPageComponent,
    CameraStreamComponent,
    FaceCapturePageComponent,
    EditPageComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    WebcamModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
