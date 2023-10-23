import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule, ViewDidEnter, ViewDidLeave} from '@ionic/angular';
import {CardComponent} from "../../../shared/components/card/card.component";
import {Subscription} from "rxjs";
import {FilterService} from "../../../shared/services/filter/filter.service";
import {StoryService} from "../../../core/http/story/story.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {CreateStoryComponent} from "../../components/create-story/create-story.component";
import {Story} from "../../../shared/models/Story";
import {HttpErrorResponse} from "@angular/common/http";
import {HeaderComponent} from "../../../core/templates/header/header.component";
import {Tag} from "../../../shared/models/Tag";
import {OperationsService} from "../../../shared/services/operations/operations.service";

@Component({
  selector: 'app-story',
  templateUrl: './story.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CardComponent, HeaderComponent]
})
export class StoryPage implements OnInit, OnDestroy, ViewDidEnter, ViewDidLeave {

  storySubscription: Subscription;
  deleteSubscription: Subscription;
  newStoryCheckerSubscription: Subscription;
  isAWorldBeingCreated: boolean;

  constructor(
    public filterService: FilterService,
    private loadContentService: LoadContentService,
    private storyService: StoryService,
    private modalService: ModalService,
    private toastService: ToastService,
    private operationsService: OperationsService
  ) {
    this.isAWorldBeingCreated = false;
    this.storySubscription = new Subscription();
    this.newStoryCheckerSubscription = new Subscription();
    this.filterService.input = [];
    this.deleteSubscription = this.storyService.storyDeleted$.subscribe(() => {
      this.loadStory();
    });
  }

  ngOnInit() {
    this.loadStory();
  }

  ionViewDidEnter(): void {
    this.loadStory();
  }

  ngOnDestroy(): void {
    this.storySubscription.unsubscribe();
  }

  ionViewDidLeave(): void {
    this.storySubscription.unsubscribe();
  }

  async create() {
    const modal = await this.modalService.getModal(CreateStoryComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.toastService.showToast('🪐Story was created', 'success', 2500, "bottom").then(() =>
          this.loadStory()
        )
      }
    });
    await modal.present();
  }

  public loadStory() {
    this.storySubscription = this.storyService.getAll().subscribe({
      next: async (stories: Story[]) => {
        const promises = stories.map(async (story) => {
          const response = await this.operationsService.getTags(story.id, this.filterService.getTypeOfEntry(story));
          if (response) {
            story.tags = response as Tag[];
          }
          return story;
        });
        const storiesWithTags = await Promise.all(promises);
        this.filterService.input = storiesWithTags;
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
