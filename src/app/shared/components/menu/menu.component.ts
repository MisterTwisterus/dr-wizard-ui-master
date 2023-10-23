import {Component, OnInit} from '@angular/core';
import {MenuService} from "../../services/menu/menu.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ModeTogglerService} from "../../../core/services/mode-toggler/mode-toggler.service";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {TokenService} from "../../../core/services/token/token.service";
import {ToastService} from "../../services/toast/toast.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
  standalone: true
})
export class MenuComponent implements OnInit {

  token: string;

  constructor(
    public menuService: MenuService,
    public modeTogglerService: ModeTogglerService,
    private tokenService: TokenService,
    private toastService: ToastService
  ) {
    this.token = '';
  }

  ngOnInit() {
    this.token = this.tokenService.token;
  }

  changeDarkMode(isDark: boolean) {
    this.modeTogglerService.setDarkMode(isDark);
  }

  saveToken() {
    this.toastService.showToast('Token saved', 'primary', 1500, "bottom").then(() => {
        this.tokenService.setToken(this.token)
        window.location.reload();
      }
    );
  }

  import() {

  }

  export() {

  }

}
