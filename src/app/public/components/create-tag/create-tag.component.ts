import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {IonicModule, ModalController} from "@ionic/angular";
import {PlainTextConverterService} from "../../../shared/services/plain-text-converter/plain-text-converter.service";
import {CommonModule} from "@angular/common";
import {IonicSelectableComponent} from "ionic-selectable";
import {StorageService} from "../../../core/services/storage/storage.service";
import {Tag} from "../../../shared/models/Tag";
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-create-tag',
  templateUrl: './create-tag.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonicSelectableComponent]
})
export class CreateTagComponent {

  files: FileList | null;

  tagForm: FormGroup;
  tag: Tag;

  constructor(
    public modalService: ModalService,
    private storageService: StorageService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController,
    private plainTextConverter: PlainTextConverterService,
  ) {
    this.files = null;
    this.tag = new Tag('', '', '', new Date(), false);
    this.tagForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      color: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(8)]],
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
              if (this.files && this.tagForm.get('name')?.value === '') {
                this.tagForm.get('name')?.setValue(this.files[0].name.split('.')[0])
              }
              this.tagForm.get('color')?.setValue(this.tagForm.get('color')?.value + text)
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
    this.tag = new Tag(uuidv4(), this.tagForm.get('name')?.value, this.tagForm.get('color')?.value, new Date(), false)
    this.storageService.get(this.tag.name)?.then(
      (result) => {
        if (result) {
          this.toastService.showToast('🤯Entry with this name already exists', "warning", 2500, "bottom")
        } else {
          this.storageService.set(this.tag.name, this.tag)?.then(
            () => {
              this.modalController.dismiss(true);
            },
            () => {
              this.toastService.showToast('💥Entry could not be created', 'danger', 2500, "bottom");
            }
          );
        }
      }
    )
  }
}
