import { ErrorHandler, Injectable} from '@angular/core';
import { GAService } from './ga.service';

@Injectable()
export class GAErrorHandler implements ErrorHandler {
  constructor(private _ga: GAService) { }
  
  handleError(error) {
    this._ga.sendEvent('core', 'error', error.toString());
    throw error;
  }
}