import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LoginService {

  loggedInState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  changeLogin = () => this.loggedInState.next(!this.loggedInState.getValue());

  constructor() { }

}
