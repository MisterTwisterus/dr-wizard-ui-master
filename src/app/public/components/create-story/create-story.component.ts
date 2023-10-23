import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {WorldService} from "../../../core/http/world/world.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {HttpErrorResponse} from "@angular/common/http";
import {IonicSelectableComponent} from "ionic-selectable";
import {PlainTextConverterService} from "../../../shared/services/plain-text-converter/plain-text-converter.service";
import {World} from "../../../shared/models/World";
import {StoryService} from "../../../core/http/story/story.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {IStoryCreate} from "../../../shared/models/repsonse/IStoryCreate";
import {IStatus} from "../../../shared/models/repsonse/IStatus";
import {captureError} from "rxjs/internal/util/errorContext";

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonicSelectableComponent]
})
export class CreateStoryComponent implements OnInit {

  @Output() storyCreationEvent = new EventEmitter<number | string>();

  files: FileList | null;
  worlds: World[];

  wordsSubscription: Subscription;

  storyCreateSubscription: Subscription;

  storyForm: FormGroup;

  constructor(
    public modalService: ModalService,
    private worldService: WorldService,
    private storyService: StoryService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController,
    private plainTextConverter: PlainTextConverterService,
    private loadContentService: LoadContentService
  ) {
    this.worlds = [];
    this.files = null;
    this.wordsSubscription = new Subscription();
    this.storyCreateSubscription = new Subscription();
    this.storyForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      world: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(8)]],
      text: ['', []]
    });
  }

  ngOnInit(): void {
    this.wordsSubscription = this.worldService.getAll().subscribe({
      next: ((response: World[]) => {
        this.worlds = response;
        this.loadContentService.isLoading = false;
      }),
      error: (error: HttpErrorResponse) => console.error(error)
    })
  }

  ngOnDestroy(): void {
    this.storyCreateSubscription.unsubscribe();
    this.wordsSubscription.unsubscribe();
  }

  async handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.files = target.files;
    if (this.files) {
      let text = '\n';
      switch (this.files[0].type) {
        case 'text/plain':
          text = await this.plainTextConverter.convertToPlainText(this.files[0]);
          this.toastService.showToast('😉Text from ' + this.files[0].name + 'was inserted', 'primary', 1500, "bottom").then(
            () => {
              if (this.files && this.storyForm.get('name')?.value === '') {
                this.storyForm.get('name')?.setValue(this.files[0].name.split('.')[0])
              }
              this.storyForm.get('text')?.setValue(this.storyForm.get('text')?.value + text)
            }
          )
          break;
        default:
          await this.toastService.showToast('😑Unsupported filetype', 'danger', 1500, "bottom")
          break;
      }
    }
  }

  save() {
    this.storyCreateSubscription = this.storyService.create(this.storyForm.get('name')?.value, this.storyForm.get('world')?.value).subscribe({
      next: (response: IStoryCreate) => {
        if (response.success) {
          this.storyCreateSubscription = this.storyService.addText(response.data.story_id, this.storyForm.get('text')?.value).subscribe({
            next: (response: IStatus) => {
              if (response.success) {
                this.modalService.closeModal();
              } else {
                this.toastService.showToast("💥Couldn't add text to Story", 'warning', 2500, "bottom");
              }
            },
            error: (error: HttpErrorResponse) => console.error(error)
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
  }
}
