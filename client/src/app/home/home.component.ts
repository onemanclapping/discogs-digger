import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/concat';

import { ProgressOverlayService } from '../progress-overlay/progress-overlay.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public isInputValid = false;
  public isWorking = false;
  public loggedIn;
  public seller;
  public user;

  private _subscription;
  
  constructor(
    private _apiService: ApiService,
    private _loginService: LoginService,
    private _progressOverlayService: ProgressOverlayService,
    private _router: Router
  ) { }
  
  ngOnInit() {
    this._loginService.loggedInSubject.subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.user = state.user;
    });
    this._progressOverlayService.setCancelCallback(() => {
      this._subscription.unsubscribe();
    });
  }

  fetchData() {
    this._subscription = this._apiService.fetchBuyerAndSeller(this.user, this.seller).subscribe(res => {
      this._router.navigate(['/results', this.seller]);
    });
  }

  login() {
    window.location.href = '/api/authorize';
  }

  setSeller(event: KeyboardEvent) {
    this.seller = (<HTMLInputElement>event.target).value.trim();
    this.isInputValid = !!this.seller;

    if (this.isInputValid && event.keyCode == 13) {
      this.fetchData();
    }
  }
}
