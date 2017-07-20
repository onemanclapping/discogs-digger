import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultsService } from '../app/results.service';
import { ApiService } from '../app/api.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  sellerId: String = 'seller';
  rawResults: any[];
  filteredResults: any[];
  isFiltersOpen: boolean = false;
  buyerProgressValue: Number = 0;
  sellerProgressValue: Number = 0;
  isWorking: boolean = true;
  headers:any = [
    {
      name: 'artist',
      canOrder: true,
      desc: false,
      inactive: true
    },
    {
      name: 'title',
      canOrder: true,
      desc: false,
      inactive: true
    },
    {
      name: 'media',
      canOrder: false
    },
    {
      name: 'condition',
      canOrder: false
    },
    {
      name: 'price',
      canOrder: true,
      desc: false,
      inactive: true
    }
  ];
  // TODO would be cool to get this from the actual results
  filters = [{
    name: 'Media',
    property: 'media',
    options: [{
      name: 'LP',
      selected: false
    }, {
      name: '12"',
      selected: false
    }, {
      name: '7"',
      selected: false
    }, {
      name: 'CD',
      selected: false
    }]
  }, {
    name: 'Condition',
    property: 'condition',
    options: [{
      name: 'VG',
      selected: false
    }, {
      name: 'G',
      selected: false
    }]
  }];

  constructor(private route: ActivatedRoute,
    private resultsService: ResultsService,
    private apiService: ApiService,
    private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.isWorking = true;
      this.sellerId = params['sellerId'];
        this.apiService.fetchBuyerAndSeller('onemanclap', this.sellerId).subscribe(res => {
          this.buyerProgressValue = res.buyer.progress;
          this.sellerProgressValue = res.seller.progress;
          
          if (res.buyer.result && res.seller.result) {
            this.isWorking = false;

            this.rawResults = this.matchBuyerWithSeller(res.buyer.result, res.seller.result);

            console.log(this.rawResults)
            // this.rawResults = this.resultsService.getResults(this.sellerId);
            
            this.filterResults();
            this.reOrder();
          }
        });
    });
  }

  filterResults() {
    this.filteredResults = this.rawResults.filter(item => this.filters.every(filter => {
      const activeOptions = filter.options.filter(option => option.selected).map(option => option.name);

      if (activeOptions.length === 0) return true;

      if (Array.isArray(item[filter.property])) {
        return activeOptions.some(option => item[filter.property].includes(option));
      }

      return activeOptions.includes(item[filter.property]);
    }));
  }

  toggleFilter(filterIndex, optionIndex) {
    this.filters[filterIndex].options[optionIndex].selected = !this.filters[filterIndex].options[optionIndex].selected;
    this.filterResults();
  }

  toggleFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  toggleOrderBy(index) {
    if (!this.headers[index].canOrder) return;

    if (this.headers[index].inactive) {
      for (let header of this.headers) {
        header.inactive = true;
      }
      this.headers[index].inactive = false;
    } else {
      this.headers[index].desc = !this.headers[index].desc;
    }

    this.reOrder();
  }

  reOrder() {
    const orderProp = this.headers.find(item => !item.inactive);

    if (orderProp) {
      this.filteredResults.sort((item1, item2) => {
        const prop1 = item1[orderProp.name];
        const prop2 = item2[orderProp.name];

        if (orderProp.desc) {
          return prop1 < prop2 ? 1 : 0;
        }
        return prop1 > prop2 ? 1: 0;
      });
    }
  }

  cancelFetch() {
    this.router.navigate(['/']);
  }

  matchBuyerWithSeller(buyerResults, sellerResults) {
    return sellerResults.filter(sellerItem => buyerResults.includes(sellerItem.artist));
  }
}
