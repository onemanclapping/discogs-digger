import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DigComponent } from './dig/dig.component';
import { AboutComponent } from './about/about.component';
import { DigService } from './dig/dig.service';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'dig/:buyer/:seller', component: DigComponent },
  { path: 'dig', component: DigComponent },
  { path: 'about', component: AboutComponent },
  { path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DigComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [DigService],
  bootstrap: [AppComponent]
})
export class AppModule { }
