import {Component, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FilterService} from "../../services/filter/filter.service";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SearchbarComponent implements OnInit {

  text: string;

  constructor(public filterService: FilterService, private router: Router) {
    this.text = '';
    this.router.events.subscribe(async () => {
      this.text = this.filterService.search as string;
    });
  }

  ngOnInit() {
    this.text = this.filterService.search as string;
  }

  handleInput() {
    this.filterService.search = this.text;
  }
}
