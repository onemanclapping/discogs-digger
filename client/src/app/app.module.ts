import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule, Http } from '@angular/http';

import { CookieModule } from 'ngx-cookie';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { LoginService } from './login.service';
import { ApiService } from './api.service';
import { CoreModule } from '../core/core.module';
import { InitComponent } from './init/init.component';
import { HeaderComponent } from './header/header.component';
import { ProgressOverlayComponent } from './progress-overlay/progress-overlay.component';
import { ProgressOverlayService } from './progress-overlay/progress-overlay.service';
import { GAErrorHandler } from './ga-error-handler';
import { LoggedHttpService } from './logged-http.service';
import { GAService } from './ga.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    InitComponent,
    ProgressOverlayComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent},
      { path: 'about', loadChildren: '../about/about.module#AboutModule' },
      { path: 'results', loadChildren: '../results/results.module#ResultsModule' },
      { path: '**', redirectTo: '/' }
    ]),
    CoreModule,
    CookieModule.forRoot(),
    HttpModule
  ],
  providers: [{
    provide: ErrorHandler,
    useClass: GAErrorHandler
  }, {
    provide: Http,
    useClass: LoggedHttpService
  }, LoginService, ApiService, ProgressOverlayService, GAService],
  bootstrap: [AppComponent],
})
export class AppModule { }
