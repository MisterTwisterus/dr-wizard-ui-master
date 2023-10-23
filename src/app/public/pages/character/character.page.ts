import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ViewDidEnter, ViewDidLeave} from '@ionic/angular';
import {CardComponent} from "../../../shared/components/card/card.component";
import {HeaderComponent} from "../../../core/templates/header/header.component";
import {Subscription} from "rxjs";
import {FilterService} from "../../../shared/services/filter/filter.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {OperationsService} from "../../../shared/services/operations/operations.service";
import {CreateCharacterComponent} from "../../components/create-character/create-character.component";
import {Tag} from "../../../shared/models/Tag";
import {Router} from "@angular/router";

@Component({
  selector: 'app-characters',
  templateUrl: './character.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, HeaderComponent]
})
export class CharacterPage implements OnInit, OnDestroy, ViewDidEnter, ViewDidLeave {

  charactersSubscription: Subscription;

  constructor(
    public filterService: FilterService,
    private loadContentService: LoadContentService,
    private modalService: ModalService,
    private toastService: ToastService,
    private storageService: StorageService,
    private operationsService: OperationsService,
    private router: Router
  ) {
    this.charactersSubscription = new Subscription();
    this.filterService.input = [];
    this.operationsService.operationCompleted$.subscribe(() => {
      if (router.url === '/characters') this.loadCharacters();
    });
  }

  ngOnInit() {
    this.loadCharacters();
  }

  ionViewDidEnter(): void {
    this.loadCharacters();
  }

  ngOnDestroy(): void {
    this.charactersSubscription.unsubscribe();
  }

  ionViewDidLeave(): void {
    this.charactersSubscription.unsubscribe();
  }

  async create() {
    const modal = await this.modalService.getModal(CreateCharacterComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.toastService.showToast('👤Character was created', 'success', 2500, "bottom").then(() =>
          this.loadCharacters()
        )
      }
    });
    await modal.present();
  }

  loadCharacters() {
    this.storageService.getAll().then(
      async response => {
        const promises = response.filter(response => response.type === 'character').map(async (character) => {
            const response = await this.operationsService.getTags(character.id, this.filterService.getTypeOfEntry(character));
            if (response) {
              character.tags = response as Tag[];
            }
            return character;
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
