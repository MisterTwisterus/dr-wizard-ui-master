import {Component, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IonicSelectableComponent} from "ionic-selectable";
import {ModalService} from "../../services/modal/modal.service";
import {ToastService} from "../../services/toast/toast.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {FilterService} from "../../services/filter/filter.service";
import {Tag} from "../../models/Tag";
import {Router} from "@angular/router";

@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, IonicSelectableComponent, FormsModule]
})
export class TagFilterComponent implements OnInit {

  tags: Tag[];
  selectedTags: Tag[];

  constructor(
    public filterService: FilterService,
    private modalService: ModalService,
    private toastService: ToastService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.tags = [];
    this.selectedTags = [];
    router.events.subscribe(() => {
      this.loadTags();
      this.selectedTags = [];
    });
  }

  ngOnInit() {
    this.loadTags();
  }

  tagChange(){
    this.filterService.tags = this.selectedTags;
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
