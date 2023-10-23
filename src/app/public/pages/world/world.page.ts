import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ViewDidEnter, ViewDidLeave} from '@ionic/angular';
import {WorldService} from "../../../core/http/world/world.service";
import {Observable, Subject, Subscription} from "rxjs";
import {World} from "../../../shared/models/World";
import {CardComponent} from "../../../shared/components/card/card.component";
import {SearchbarComponent} from "../../../shared/components/searchbar/searchbar.component";
import {FilterComponent} from "../../../shared/components/filter/filter.component";
import {FilterService} from "../../../shared/services/filter/filter.service";
import {TabsComponent} from "../../../shared/components/tabs/tabs.component";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {CreateWorldComponent} from "../../components/create-world/create-world.component";
import {IWorldCreateStatus} from "../../../shared/models/repsonse/IWorldCreateStatus";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HeaderComponent} from "../../../core/templates/header/header.component";
import {OperationsService} from "../../../shared/services/operations/operations.service";
import {Tag} from "../../../shared/models/Tag";

@Component({
  selector: 'app-world',
  templateUrl: './world.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, SearchbarComponent, FilterComponent, TabsComponent, HeaderComponent]
})
export class WorldPage implements OnInit, OnDestroy, ViewDidEnter, ViewDidLeave {

  worldSubscription: Subscription;
  newWorldCheckerSubscription: Subscription;
  deleteSubscription: Subscription;
  isAWorldBeingCreated: boolean;
  constructor(
    public filterService: FilterService,
    private loadContentService: LoadContentService,
    private worldService: WorldService,
    private modalService: ModalService,
    private toastService: ToastService,
    private operationsService: OperationsService
  ) {
    this.isAWorldBeingCreated = false;
    this.worldSubscription = new Subscription();
    this.newWorldCheckerSubscription = new Subscription();
    this.filterService.input = [];
    this.deleteSubscription = this.worldService.worldDeleted$.subscribe(() => {
      this.loadWorld();
    });
  }

  ngOnInit() {
    this.loadWorld();
  }

  ionViewDidEnter(): void {
    this.loadWorld();
  }

  ngOnDestroy(): void {
    this.worldSubscription.unsubscribe();
    this.deleteSubscription.unsubscribe();
  }

  ionViewDidLeave(): void {
    this.worldSubscription.unsubscribe();
    this.deleteSubscription.unsubscribe();
  }

  async create() {
    const modal = await this.modalService.getModal(CreateWorldComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.checkIfIsCreated(data.data);
      }
    });
    await modal.present();
  }

  checkIfIsCreated(uid: string | number) {
    this.isAWorldBeingCreated = true;
    this.newWorldCheckerSubscription = this.worldService.getCreationStatus(uid).subscribe({
      next: (response: IWorldCreateStatus) => {
        if (response.success) {
          if (response.data.is_ready) {
            this.toastService.showToast('🌍World was created', 'success', 2500, "bottom").then(
              () => {
                this.isAWorldBeingCreated = false;
                this.newWorldCheckerSubscription.unsubscribe();
                this.loadWorld();
              });
          } else {
            this.toastService.showToast('⌛️World is still creating', 'secondary', 5500, "bottom").then(() => {
              setTimeout(() => this.checkIfIsCreated(uid), 5000)
            })
          }
        } else {
          this.toastService.showToast('💥World could not be created', 'danger', 2500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private loadWorld() {
    this.worldSubscription = this.worldService.getAll().subscribe({
      next: async (worlds: World[]) => {
        const promises = worlds.map(async (world) => {
          const response = await this.operationsService.getTags(world.id, this.filterService.getTypeOfEntry(world));
          if (response) {
            world.tags = response as Tag[];
          }
          return world;
        });
        const worldsWithTags = await Promise.all(promises);
        this.filterService.input = worldsWithTags;
        this.loadContentService.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.filterService.input = [];
        this.loadContentService.isLoading = false;
        console.error(error);
      }
    });
  }

}
