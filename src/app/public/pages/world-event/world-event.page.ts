import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ViewDidEnter, ViewDidLeave} from '@ionic/angular';
import {HeaderComponent} from "../../../core/templates/header/header.component";
import {CardComponent} from "../../../shared/components/card/card.component";
import {Subscription} from "rxjs";
import {FilterService} from "../../../shared/services/filter/filter.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {OperationsService} from "../../../shared/services/operations/operations.service";
import {CreateCharacterComponent} from "../../components/create-character/create-character.component";
import {Tag} from "../../../shared/models/Tag";
import {CreateWorldEventComponent} from "../../components/create-world-event/create-world-event.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-world-events',
  templateUrl: './world-event.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, HeaderComponent]
})
export class WorldEventPage implements OnInit, OnDestroy, ViewDidEnter, ViewDidLeave {

  worldEventsSubscription: Subscription;

  constructor(
    public filterService: FilterService,
    private loadContentService: LoadContentService,
    private modalService: ModalService,
    private toastService: ToastService,
    private storageService: StorageService,
    private operationsService: OperationsService,
    private router: Router
  ) {
    this.worldEventsSubscription = new Subscription();
    this.filterService.input = [];
    this.operationsService.operationCompleted$.subscribe(() => {
      if(router.url === '/world-events') this.loadWorldEvents();
    });
  }

  ngOnInit() {
    this.loadWorldEvents();
  }

  ionViewDidEnter(): void {
    this.loadWorldEvents();
  }

  ngOnDestroy(): void {
    this.worldEventsSubscription.unsubscribe();
  }

  ionViewDidLeave(): void {
    this.worldEventsSubscription.unsubscribe();
  }

  async create() {
    const modal = await this.modalService.getModal(CreateWorldEventComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.toastService.showToast('📆World event was created', 'success', 2500, "bottom").then(() =>
          this.loadWorldEvents()
        )
      }
    });
    await modal.present();
  }

  loadWorldEvents() {
    this.storageService.getAll().then(
      async response => {
        const promises = response.filter(response => response.type === 'world_event').map(async (worldEvent) => {
          const response = await this.operationsService.getTags(worldEvent.id, this.filterService.getTypeOfEntry(worldEvent));
          if (response) {
            worldEvent.tags = response as Tag[];
          }
          return worldEvent;
        });
        const charactersWithTags = await Promise.all(promises);
        if(charactersWithTags.length !== 0){
          this.filterService.input = charactersWithTags;
        }else{
          this.filterService.input = [];
        }
      },
      () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    )
  }
}
