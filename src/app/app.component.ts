import {Component, EnvironmentInjector, inject, OnInit} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {MenuComponent} from "./shared/components/menu/menu.component";
import {HeaderComponent} from "./core/templates/header/header.component";
import {ModeTogglerService} from "./core/services/mode-toggler/mode-toggler.service";
import {TokenService} from "./core/services/token/token.service";
import {TabsComponent} from "./shared/components/tabs/tabs.component";
import {FilterComponent} from "./shared/components/filter/filter.component";
import {SearchbarComponent} from "./shared/components/searchbar/searchbar.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MenuComponent, HeaderComponent, TabsComponent, FilterComponent, SearchbarComponent],
})
export class AppComponent implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(
    private modeTogglerService: ModeTogglerService,
    private tokenService: TokenService
  ) {
  }

  ngOnInit(): void {
    this.modeTogglerService.checkModeAndLoadIt();
    this.tokenService.checkTokenAndLoadIt();
  }
}
