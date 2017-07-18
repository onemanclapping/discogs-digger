import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../app/results.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  sellerId: String = 'seller';
  results;
  isFiltersOpen: boolean = false;
  headers = [
    {
      name: 'artist',
      canOrder: true,
      desc: false,
      inactive: false
    },
    {
      name: 'title',
      canOrder: true,
      desc: false,
      inactive: true
    },
    {
      name: 'media',
      canOrder: false,
      desc: false,
      inactive: true
    },
    {
      name: 'condition',
      canOrder: true,
      desc: false,
      inactive: true
    },
    {
      name: 'price',
      canOrder: true,
      desc: false,
      inactive: true
    }
  ];

  constructor(private route: ActivatedRoute, private resultsService: ResultsService) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.sellerId = params['sellerId']);
    this.results = this.resultsService.getResults(this.sellerId);
  }

  toggleFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  orderBy(index) {
    if (this.headers[index].inactive) {
      for (let header of this.headers) {
        header.inactive = true;
      }
      this.headers[index].inactive = false;
    } else {
      this.headers[index].desc = !this.headers[index].desc;
    }
  }
}
