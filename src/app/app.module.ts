import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StartPageComponent } from './start-page/start-page.component';
import { RouterModule, Routes } from '@angular/router';
import { CameraStreamComponent } from './camera-stream/camera-stream.component';
import { WebcamModule } from 'ngx-webcam';
import { FaceCapturePageComponent } from './face-capture-page/face-capture-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';
import { SetupPageComponent } from './setup-page/setup-page.component';



import { CovalentLayoutModule } from '@covalent/core/layout';
import { CovalentStepsModule  } from '@covalent/core/steps';
/* any other core modules */
// (optional) Additional Covalent Modules imports
import { CovalentHttpModule } from '@covalent/http';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { CovalentDynamicFormsModule } from '@covalent/dynamic-forms';
import { CovalentBaseEchartsModule } from '@covalent/echarts/base';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CovalentLoadingModule } from '@covalent/core/loading';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import { CodePageComponent } from './code-page/code-page.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AngularCropperjsModule } from 'angular-cropperjs';
import {MatSliderModule} from '@angular/material/slider';
import { FormsModule } from '@angular/forms';


const appRoutes: Routes = [
  { path: '', redirectTo: '/setup', pathMatch: 'full' },
  { path: 'start', component: StartPageComponent},
  { path: 'setup', component: SetupPageComponent},
  { path: 'capture', component: FaceCapturePageComponent},
  { path: 'code', component: CodePageComponent},
  { path: 'edit', component: EditPageComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    StartPageComponent,
    CameraStreamComponent,
    FaceCapturePageComponent,
    EditPageComponent,
    SetupPageComponent,
    CodePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
    WebcamModule,
    CovalentLayoutModule,
    CovalentStepsModule,
    // (optional) Additional Covalent Modules imports
    CovalentHttpModule.forRoot(),
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentDynamicFormsModule,
    CovalentBaseEchartsModule,
    BrowserAnimationsModule,
    CovalentLoadingModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    AngularCropperjsModule,
    MatSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
