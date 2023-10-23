import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {IonicModule, ModalController} from "@ionic/angular";
import {PlainTextConverterService} from "../../../shared/services/plain-text-converter/plain-text-converter.service";
import {v4 as uuidv4} from "uuid";
import {CommonModule} from "@angular/common";
import {IonicSelectableComponent} from "ionic-selectable";
import {Character} from "../../../shared/models/Character";

@Component({
  selector: 'app-create-character',
  templateUrl: './create-character.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonicSelectableComponent]
})
export class CreateCharacterComponent {

  files: FileList | null;

  characterForm: FormGroup;
  character: Character;

  constructor(
    public modalService: ModalService,
    private storageService: StorageService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController,
    private plainTextConverter: PlainTextConverterService,
  ) {
    this.files = null;
    this.character = new Character('', '', '', new Date(), [],false);
    this.characterForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(250)]],
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
              if (this.files && this.characterForm.get('name')?.value === '') {
                this.characterForm.get('name')?.setValue(this.files[0].name.split('.')[0])
              }
              this.characterForm.get('description')?.setValue(this.characterForm.get('description')?.value + text)
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
    this.character = new Character(uuidv4(), this.characterForm.get('name')?.value, this.characterForm.get('description')?.value, new Date(),[], false)
    this.storageService.get('character_' + this.character.name)?.then(
      (result) => {
        if (result) {
          this.toastService.showToast('🤯This Character already exists', "warning", 2500, "bottom");
        } else {
          this.storageService.set('character_' + this.character.name, this.character)?.then(
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
