import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public showHome;
  public shrink;

  constructor(private _router: Router) { }

  ngOnInit() {
    this._router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.showHome = e.url !== '/';
      }
    });
  }

  @HostListener('window:scroll')
  onScrollEvent() {
    this.shrink = window.scrollY > 30;
  }
}