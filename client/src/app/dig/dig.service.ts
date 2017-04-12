import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class DigService {

  constructor(private http: Http) {
    this.http.get('http://localhost:3000/dig/onemanclap/CliffsMargate').subscribe(res => console.log(res.json()));
  }

}
