import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {WorldService} from "../../../core/http/world/world.service";
import {Subscription} from "rxjs";
import {IWorldCreate} from "../../../shared/models/repsonse/IWorldCreate";
import {HttpErrorResponse} from "@angular/common/http";
import {PlainTextConverterService} from "../../../shared/services/plain-text-converter/plain-text-converter.service";

@Component({
  selector: 'app-create-world',
  templateUrl: './create-world.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CreateWorldComponent implements OnDestroy {

  @Output() worldCreationEvent = new EventEmitter<number | string>();

  worldForm: FormGroup;

  files: FileList | null;

  worldCreateSubscription: Subscription;

  constructor(
    public modalService: ModalService,
    private worldService: WorldService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController,
    private plainTextConverter: PlainTextConverterService
  ) {
    this.worldCreateSubscription = new Subscription();
    this.files = null;
    this.worldForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnDestroy(): void {
    this.worldCreateSubscription.unsubscribe();
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
              if (this.files && this.worldForm.get('name')?.value === '') {
                this.worldForm.get('name')?.setValue(this.files[0].name.split('.')[0])
              }
              this.worldForm.get('text')?.setValue(this.worldForm.get('text')?.value + text)
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
    this.worldCreateSubscription = this.worldService.create(this.worldForm.get('name')?.value, this.worldForm.get('text')?.value).subscribe({
      next: (response: IWorldCreate) => {
        if (response.success) {
          this.toastService.showToast('🌍World is being created', 'primary', 2500, "bottom").then(
            () => {
              this.modalController.dismiss(response.data.world_id);
            }
          )
        } else {
          this.toastService.showToast('💥World could not be created', 'danger', 2500, "bottom");
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.toastService.showToast('🧑🏼‍🤝‍🧑🏼World with this name already exists. Choose another name', 'danger', 2500, "bottom")
        } else {
          this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
        }
      }
    });
  }
}
