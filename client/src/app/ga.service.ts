import { Injectable } from '@angular/core';

@Injectable()
export class GAService {
  private _ga = (<any>window).ga;

  constructor() {}

  sendEvent(eventCategory, eventAction, eventLabel?, eventValue?) {
    this._ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
  }

  sendPageView(url) {
    this._ga('send', 'pageview', url);
  }
}
