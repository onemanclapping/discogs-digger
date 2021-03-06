import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { LoginService } from './login.service';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  public title = 'app';
  public isConnected = false;
  public isFetchingResults = false;
  public buyerProgressValue;
  public sellerProgressValue;
  public sellerName;

  constructor(private _loginService: LoginService, private _router: Router) {}

  ngOnInit() {
    this._loginService.loggedInSubject.subscribe(() => this.isConnected = true)

    this._router.events.subscribe((event:NavigationEnd) => {
      if (event instanceof NavigationEnd) {
        (<any>window).ga('send', 'pageview', event.url);
      }
    });
  }

}
