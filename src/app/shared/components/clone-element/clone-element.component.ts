import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {IStoryCreate} from "../../models/repsonse/IStoryCreate";
import {IStatus} from "../../models/repsonse/IStatus";
import {HttpErrorResponse} from "@angular/common/http";
import {ModalService} from "../../services/modal/modal.service";
import {StoryService} from "../../../core/http/story/story.service";
import {Story} from "../../models/Story";
import {ToastService} from "../../services/toast/toast.service";
import {World} from "../../models/World";
import {ITextResponse} from "../../models/repsonse/ITextResponse";
import {StorageService} from "../../../core/services/storage/storage.service";
import {v4 as uuidv4} from "uuid";
import {ISettings} from "../../models/repsonse/ISettings";

@Component({
  selector: 'app-clone-element',
  templateUrl: './clone-element.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CloneElementComponent implements OnInit, OnDestroy {

  @Input({required: true}) content: Story | any;

  cloneSubscription: Subscription;

  cloneForm: FormGroup;

  text: string;

  constructor(
    public modalService: ModalService,
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private storyService: StoryService,
    private toastService: ToastService,
    private modalController: ModalController
  ) {
    this.content = null;
    this.cloneSubscription = new Subscription();
    this.text = '';
    this.cloneForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    });
  }

  ngOnInit(): void {
    if (this.content instanceof Story) {
      this.cloneSubscription = this.storyService.getText(this.content.id).subscribe({
        next: (response: ITextResponse) => {
          this.text = response.data.story_text;
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.cloneSubscription.unsubscribe();
  }

  save() {
    if (this.content instanceof Story) {
      this.cloneSubscription = this.storyService.create(this.cloneForm.get('name')?.value, new World(this.content.worldId, '', new Date(), [], false)).subscribe({
        next: (response: IStoryCreate) => {
          if (response.success) {
            this.storageService.set('story_' + response.data.story_id, this.content.tags)?.then(() => {
            }, () => {
            });
            const storyId: number = response.data.story_id;
            this.cloneSubscription = this.storyService.addText(storyId, this.text).subscribe({
              next: (response: IStatus) => {
                if (response.success) {
                  this.cloneSubscription = this.storyService.getSettings(this.content.id).subscribe({
                    next: (response: ISettings) => {
                      if (response.success) {
                        this.cloneSubscription = this.storyService.updateSettings(
                          storyId,
                          response.data.model_name,
                          '',
                          response.data.authors_note,
                          response.data.memory_section,
                          response.data.nsfw,
                          response.data.adventure_mode,
                          response.data.automatic_guidelines,
                          response.data.automatic_memory,
                          response.data.max_output_length,
                          response.data.number_of_generations
                        ).subscribe({
                          next: (response: IStatus) => {
                            if (response.success) {
                              this.modalController.dismiss(true);
                            } else {
                              this.toastService.showToast("💥Couldn't settings from story", 'warning', 2500, "bottom");
                            }
                          }
                        })
                      } else {
                        this.toastService.showToast("💥Couldn't settings from story", 'warning', 2500, "bottom");
                      }
                    }
                  })
                } else {
                  this.toastService.showToast("💥Couldn't add text to Story", 'warning', 2500, "bottom");
                }
              }
            })
          } else {
            this.toastService.showToast('💥Story could not be created', 'danger', 2500, "bottom");
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.toastService.showToast('🧑🏼‍🤝‍🧑🏼Story with this name already exists. Choose another name', 'danger', 2500, "bottom")
          } else {
            this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
          }
        }
      });
    } else {
      const uuid = uuidv4();
      const item = {...this.content};
      item.id = uuid;
      item.name = this.cloneForm.get('name')?.value;
      const updatedItem = item;
      this.storageService.get(this.content.type + '_' + this.cloneForm.get('name')?.value)?.then(
        (result) => {
          console.log('ets')
          if (result) {
            this.toastService.showToast('💥Name already in use', 'danger', 2500, "bottom");
          } else {
            this.storageService.set(this.content.type + "_" + this.cloneForm.get('name')?.value, updatedItem)?.then(
              () => {
                this.storageService.set(this.content.type + "_" + uuid, updatedItem.tags)?.then(
                  () => {
                    this.modalController.dismiss(true);
                  },
                  () => {
                    this.toastService.showToast('💥Could not copy', 'danger', 2500, "bottom");
                  }
                );
              });
          }
        },
        () => {
        });
    }
  }
}
