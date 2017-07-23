import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { CookieService } from 'ngx-cookie';
import { ApiService } from './api.service';

@Injectable()
export class LoginService {
  public loggedInSubject: ReplaySubject<any> = new ReplaySubject<any>();
  
  private _loggedOutState = {loggedIn: false};

  constructor(private _apiService: ApiService, private _cookieService: CookieService) {
    if (this._cookieService.get('token')) {
      this._apiService.getIdentity().subscribe((res: any) => {
        if (res.username) {
          this.loggedInSubject.next({loggedIn: true, user: <any>res.username});
        } else {
          this.logOut();
        }
      });
    } else {
      this.loggedInSubject.next(this._loggedOutState);
    }
  }

  logOut() {
    this._cookieService.remove('token');
    this._cookieService.remove('tokenSecret');
    this.loggedInSubject.next(this._loggedOutState);
  }
}
