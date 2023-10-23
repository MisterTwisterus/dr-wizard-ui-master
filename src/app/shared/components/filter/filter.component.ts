import {Component} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FilterService} from "../../services/filter/filter.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FilterComponent {

  constructor(private filterService: FilterService) {
  }

  getFilterIcon(filter: 'name' | 'date' | 'selection') {
    if (this.filterService.filters === filter) {
      if (this.filterService.filterType === 'asc') {
        return 'chevron-down';
      } else if (this.filterService.filterType === 'desc') {
        return 'chevron-up';
      }
    }
    return 'remove';
  }

  selectFilter(filter: 'name' | 'date' | 'selection') {
    if (this.filterService.filters !== filter) {
      this.filterService.filters = filter;
      this.filterService.filterType = 'asc';
    } else {
      switch (this.filterService.filterType) {
        case 'asc':
          this.filterService.filterType = 'desc';
          break;
        case 'desc':
          this.filterService.filterType = null;
          break;
        case null:
          this.filterService.filterType = 'asc';
          break;
      }
    }
  }
}
