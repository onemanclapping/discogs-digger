import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  headers = [
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

  constructor(private route: ActivatedRoute, private resultsService: ResultsService, private apiService: ApiService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sellerId = params['sellerId'];
      this.apiService.fetchBuyer('onemanclap').subscribe(buyerData => {
        this.apiService.fetchSeller(this.sellerId).subscribe(sellerData => {
          console.log(buyerData)
          console.log(sellerData)
        })
      })
    });
    this.rawResults = this.resultsService.getResults(this.sellerId);
    
    this.filterResults();
    this.reOrder();
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
}
