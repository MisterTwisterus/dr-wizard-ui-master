import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ViewDidEnter, ViewDidLeave} from '@ionic/angular';
import {Subscription} from "rxjs";
import {FilterService} from "../../../shared/services/filter/filter.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {CardComponent} from "../../../shared/components/card/card.component";
import {StorageService} from "../../../core/services/storage/storage.service";
import {CreateTagComponent} from "../../components/create-tag/create-tag.component";
import {OperationsService} from "../../../shared/services/operations/operations.service";
import {HeaderComponent} from "../../../core/templates/header/header.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, HeaderComponent]
})
export class TagsPage implements OnInit, OnDestroy, ViewDidEnter, ViewDidLeave {

  tagsSubscription: Subscription;

  constructor(
    public filterService: FilterService,
    private loadContentService: LoadContentService,
    private modalService: ModalService,
    private toastService: ToastService,
    private storageService: StorageService,
    private operationsService: OperationsService,
    private router: Router
  ) {
    this.tagsSubscription = new Subscription();
    this.filterService.input = [];
    this.operationsService.operationCompleted$.subscribe(() => {
      if(router.url === '/tags') this.loadTags();
    });
  }

  ngOnInit() {
    this.loadTags();
  }

  ionViewDidEnter(): void {
    this.loadTags();
  }

  ngOnDestroy(): void {
    this.tagsSubscription.unsubscribe();
  }

  ionViewDidLeave(): void {
    this.tagsSubscription.unsubscribe();
  }

  async create() {
    const modal = await this.modalService.getModal(CreateTagComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.toastService.showToast('🏷️Tag was created', 'success', 2500, "bottom").then(() =>
          this.loadTags()
        )
      }
    });
    await modal.present();
  }

  loadTags() {
    this.storageService.getAll().then(
      response => this.filterService.input = response.filter(value => value.type === 'tags'),
      () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    )
  }
}
