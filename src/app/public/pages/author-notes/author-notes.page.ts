import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonicModule, ViewDidEnter, ViewDidLeave} from '@ionic/angular';
import {Subscription} from "rxjs";
import {FilterService} from "../../../shared/services/filter/filter.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {OperationsService} from "../../../shared/services/operations/operations.service";
import {CreateWorldEventComponent} from "../../components/create-world-event/create-world-event.component";
import {Tag} from "../../../shared/models/Tag";
import {CardComponent} from "../../../shared/components/card/card.component";
import {HeaderComponent} from "../../../core/templates/header/header.component";
import {CreateAuthorNoteComponent} from "../../components/create-author-note/create-author-note.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-author-notes',
  templateUrl: './author-notes.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, HeaderComponent]
})
export class AuthorNotesPage implements OnInit, OnDestroy, ViewDidEnter, ViewDidLeave {

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
      if(router.url === '/author-notes') {
        this.loadAuthorNotes();
      }
    });
  }

  ngOnInit() {
    this.loadAuthorNotes();
  }

  ionViewDidEnter(): void {
    this.loadAuthorNotes();
  }

  ngOnDestroy(): void {
    this.worldEventsSubscription.unsubscribe();
  }

  ionViewDidLeave(): void {
    this.worldEventsSubscription.unsubscribe();
  }

  async create() {
    const modal = await this.modalService.getModal(CreateAuthorNoteComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.toastService.showToast('🗒Author note was created', 'success', 2500, "bottom").then(() =>
          this.loadAuthorNotes()
        )
      }
    });
    await modal.present();
  }

  loadAuthorNotes() {
    this.storageService.getAll().then(
      async response => {
        const promises = response.filter(response => response.type === 'author-note').map(async (authorNote) => {
          const response = await this.operationsService.getTags(authorNote.id, this.filterService.getTypeOfEntry(authorNote));
          if (response) {
            authorNote.tags = response as Tag[];
          }
          return authorNote;
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
