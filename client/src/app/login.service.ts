import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CookieService } from 'ngx-cookie';
import { ApiService } from './api.service';

@Injectable()
export class LoginService {

  loggedInState: BehaviorSubject<any> = new BehaviorSubject<any>({loggedIn: false});

  constructor(private cookieService: CookieService, private apiService: ApiService) {
    if (this.cookieService.get('token')) {
      this.apiService.getIdentity().subscribe((res: any) => {
        this.loggedInState.next({loggedIn: true, user: <any>res.username});
      });
    }
  }

  logOut() {
    this.cookieService.remove('token');
    this.cookieService.remove('tokenSecret');
    this.loggedInState.next({loggedIn: false});
  }
}
