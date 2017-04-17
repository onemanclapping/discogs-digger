import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DigService {
  constructor(private http: Http) {}

  dig(buyer: string = 'joaodbarbosa10', seller: string = 'satyr84') {
    return this.http.get(`/api/${buyer}/${seller}`)
      .map(res => res.json());
  }
}
