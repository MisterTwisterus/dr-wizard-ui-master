import { Component, OnInit } from '@angular/core';
import {Tag} from "../../../shared/models/Tag";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {IonicSelectableComponent} from "ionic-selectable";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, IonicSelectableComponent, FormsModule]
})
export class AddTagComponent implements OnInit {

  tags: Tag[];
  selectedTags: Tag[];

  constructor(
    public modalService: ModalService,
    private toastService: ToastService,
    private modalController: ModalController,
    private storageService: StorageService
  ) {
    this.tags = [];
    this.selectedTags = [];
  }

  ngOnInit() {
    this.loadTags();
  }

  save() {
    this.modalController.dismiss(this.selectedTags);
  }

  private loadTags() {
    this.storageService.getAll().then(
      response => {
        this.tags = response.filter(value => value.type === 'tags')
      },
      () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    )
  }
}
