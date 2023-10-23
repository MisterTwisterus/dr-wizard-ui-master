import {Injectable} from '@angular/core';
import {MenuController} from "@ionic/angular";
import {MenuTypes} from "../../models/types/MenuTypes";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(
    private menuCtrl: MenuController,
    private router: Router
  ) {
    router.events.subscribe(() => {
      this.closeMenu();
    });
  }

  openMenu(menuType: MenuTypes) {
    this.menuCtrl.enable(true, menuType);
    this.menuCtrl.open(menuType);
  }

  closeMenu() {
    this.menuCtrl.close();
  }
}
