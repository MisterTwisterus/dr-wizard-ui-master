import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {World} from "../../models/World";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Story} from "../../models/Story";
import {ModalService} from "../../services/modal/modal.service";
import {ShowWorldComponent} from "../../../public/components/show-world/show-world.component";
import {ShowStoryComponent} from "../../../public/components/show-story/show-story.component";
import {PlayComponent} from "../../../public/components/play/play.component";
import {CloneElementComponent} from "../clone-element/clone-element.component";
import {Tag} from "../../models/Tag";
import {StoryService} from "../../../core/http/story/story.service";
import {Subscription} from "rxjs";
import {IStatus} from "../../models/repsonse/IStatus";
import {ToastService} from "../../services/toast/toast.service";
import {HttpErrorResponse} from "@angular/common/http";
import {OperationsService} from "../../services/operations/operations.service";
import {FilterService} from "../../services/filter/filter.service";
import {Character} from "../../models/Character";
import {logoHackernews} from "ionicons/icons";
import {Description} from "../../models/Description";
import {ShownDescriptionComponent} from "../../../public/components/shown-description/shown-description.component";
import {PredefinedColors} from "@ionic/core";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CardComponent implements OnInit {

  @Input({required: true}) content: Story | World | Tag | Character | any;
  @Input({required: true}) color: PredefinedColors;

  @Output() updateSelect = new EventEmitter<string | number>();
  @Output() updateTags = new EventEmitter<Tag[]>();

  @Output() reload = new EventEmitter<void>();

  changeNameSubscription: Subscription;

  name: string;

  constructor(
    private modalService: ModalService,
    private storyService: StoryService,
    private toastService: ToastService,
    private operationsService: OperationsService,
    private filterService: FilterService
  ) {
    this.color = 'dark';
    this.name = '';
    this.content = new World(0, '', new Date(), [], false);
    this.changeNameSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.name = this.content.name.toString();
  }

  select(value: string | number) {
    this.updateSelect.emit(value);
  }

  async open() {
    let modal;
    if(this.isNotTagOrWorldOrStory()){
      modal = await this.modalService.getModal(this.getComponent(), 'auto-height', true, {content: this.content});
    } else {
      modal = await this.modalService.getModal(ShownDescriptionComponent, 'auto-height', true, {description: new Description(this.content.name, this.content.description)});
    }
    await modal.present();
  }

  async play() {
    const modal = await this.modalService.getModal(PlayComponent, 'play-modal', true, {story: this.content});
    await modal.present();
  }

  async clone() {
    const modal = await this.modalService.getModal(CloneElementComponent, 'auto-height', true, {content: this.content});
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.reload.emit();
      }
    });
    await modal.present();
  }

  checkIfStory() {
    return this.content instanceof Story;
  }

  deleteTag(uid: string | number) {
    this.content.tags = this.content.tags.filter((tag: Tag) => {
      return tag.id !== uid
    });
    if(this.content.tags.length !== 0){
      this.operationsService.addTags(this.filterService.getTypeOfEntry(this.content), this.content.id, this.content.tags)
    } else {
      this.operationsService.removeTag(this.content.id, this.filterService.getTypeOfEntry(this.content));
    }
    this.filterService.sort();
    if(!this.filterService.output.includes(this.content)){
      this.filterService.changeSelection(this.content.id, false);
    }
  }

  changeName() {
    if(this.content.name.length > 0){
      this.storyService.updateText(this.content.id, this.content.name).subscribe({
        next: (response: IStatus) => {
          if (response.success) {
            this.name = this.content.name;
          } else {
            this.content.name = this.name;
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.toastService.showToast('🧑🏼‍🤝‍A story with this name already exists. Choose another name', 'danger', 2500, "bottom")
          } else {
            this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
          }
          this.content.name = this.name;
        },
      })
    } else {
      this.toastService.showToast('🙃A story name needs to have text', 'warning', 2500, "bottom")
      this.content.name = this.name;
    }
  }

  getWorldName(): string {
    if (this.content instanceof Story) {
      return this.content?.worldName as string;
    }
    return '';
  }

  getColor(): string {
    return this.content?.color as string;
  }

  isNotTag(): boolean {
    if (this.content.type !== 'tags') {
      return true;
    }
    return false;
  }

  isNotTagOrWorld(): boolean {
    if (this.content.type !== 'tags' || this.content instanceof World) {
      return true;
    }
    return false;
  }

  isNotTagOrWorldOrStory(): boolean {
    if (!this.content.type || this.content instanceof World || this.content instanceof Story) {
      return true;
    }
    return false;
  }

  private getComponent(): any {
    if (this.checkIfStory()) {
      return ShowStoryComponent;
    } else {
      return ShowWorldComponent;
    }
  }

}
