import {Component} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {MenuService} from "../../../shared/services/menu/menu.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {SearchbarComponent} from "../../../shared/components/searchbar/searchbar.component";
import {FilterComponent} from "../../../shared/components/filter/filter.component";
import {TagFilterComponent} from "../../../shared/components/tag-filter/tag-filter.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [IonicModule, CommonModule, SearchbarComponent, FilterComponent, TagFilterComponent],
  standalone: true
})
export class HeaderComponent {

  constructor(
    public loadContentService: LoadContentService,
    public menuService: MenuService,
  ) {
  }

}
