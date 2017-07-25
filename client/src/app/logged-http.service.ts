import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { GAService } from './ga.service';

@Injectable()
export class LoggedHttpService extends Http {

  constructor(backend: XHRBackend, defaultOptions: RequestOptions, private _ga: GAService) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((e: Response) => {
      const error = {statusCode: e.status, url};
      this._ga.sendEvent('core', 'error', JSON.stringify(error));
      return Observable.throw(error);
    });
  }
}

