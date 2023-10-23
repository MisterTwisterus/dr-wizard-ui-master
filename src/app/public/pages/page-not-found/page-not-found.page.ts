import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {RouterModule} from "@angular/router";
import {HeaderComponent} from "../../../core/templates/header/header.component";

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, HeaderComponent],
})
export class PageNotFoundPage {
}
