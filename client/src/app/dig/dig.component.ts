import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DigService } from './dig.service';

@Component({
  selector: 'app-dig',
  templateUrl: './dig.component.html',
  styleUrls: ['./dig.component.css']
})
export class DigComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private digService: DigService) { }

  ngOnInit() {
    this.route.params.subscribe(params => console.log(params))
  }

}
