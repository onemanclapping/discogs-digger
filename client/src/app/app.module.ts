import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { LoginService } from './login.service';
import { ResultsService } from './results.service';
import { ApiService } from './api.service';

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
    ])
  ],
  providers: [LoginService, ResultsService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
