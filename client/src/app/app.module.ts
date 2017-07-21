import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { LoginService } from './login.service';
import { ResultsService } from './results.service';
import { ApiService } from './api.service';
import { CoreModule } from '../core/core.module';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent
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
    HttpClientModule
  ],
  providers: [LoginService, ResultsService, ApiService],
  bootstrap: [AppComponent],
})
export class AppModule { }
