import { Component } from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IonicSelectableComponent} from "ionic-selectable";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {PlainTextConverterService} from "../../../shared/services/plain-text-converter/plain-text-converter.service";
import {v4 as uuidv4} from "uuid";
import {WorldEvent} from "../../../shared/models/WorldEvent";

@Component({
  selector: 'app-create-world-events',
  templateUrl: './create-world-event.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonicSelectableComponent]
})
export class CreateWorldEventComponent {

  files: FileList | null;

  worldEventsForm: FormGroup;
  worldEvent: WorldEvent;

  constructor(
    public modalService: ModalService,
    private storageService: StorageService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController,
    private plainTextConverter: PlainTextConverterService
  ) {
    this.files = null;
    this.worldEvent = new WorldEvent('', '', '', new Date(), [],false);
    this.worldEventsForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]]
    });
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
              if (this.files && this.worldEventsForm.get('name')?.value === '') {
                this.worldEventsForm.get('name')?.setValue(this.files[0].name.split('.')[0])
              }
              this.worldEventsForm.get('description')?.setValue(this.worldEventsForm.get('description')?.value + text)
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
    this.worldEvent = new WorldEvent(uuidv4(), this.worldEventsForm.get('name')?.value, this.worldEventsForm.get('description')?.value, new Date(),[], false)
    this.storageService.get('world-event_' + this.worldEvent.name)?.then(
      (result) => {
        if (result) {
          this.toastService.showToast('🤯This World Event already exists', "warning", 2500, "bottom");
        } else {
          this.storageService.set('world-event_' + this.worldEvent.name, this.worldEvent)?.then(
            () => {
              this.modalController.dismiss(true);
            },
            () => {
              this.toastService.showToast('💥Character could not be created', 'danger', 2500, "bottom");
            }
          );
        }
      }
    )
  }
}
