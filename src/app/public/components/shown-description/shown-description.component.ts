import {Component, Input, OnInit} from '@angular/core';
import {ModalService} from "../../../shared/services/modal/modal.service";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {Description} from "../../../shared/models/Description";

@Component({
  selector: 'app-shown-description',
  templateUrl: './shown-description.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShownDescriptionComponent {

  @Input({required: true}) description: Description;

  constructor(
    public modalService: ModalService
  ) {
    this.description = new Description('', '');
  }
}
