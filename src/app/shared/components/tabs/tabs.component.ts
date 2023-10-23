import {Component} from '@angular/core';
import {AlertController, IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {OperationsService} from "../../services/operations/operations.service";
import {FilterService} from "../../services/filter/filter.service";
import {AddTagComponent} from "../../../public/components/add-tag/add-tag.component";
import {ModalService} from "../../services/modal/modal.service";

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TabsComponent {

  constructor(
    public alertController: AlertController,
    public operationsService: OperationsService,
    public filterService: FilterService,
    private modalService: ModalService
  ) {
  }

  async delete() {
    const alert = await this.alertController.create({
      header: 'Deletion Confirmation',
      message: 'Are you sure about deleting the selected entries. They will be lost forever!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.filterService.delete();
          },
        },
      ],
    });
    await alert.present();
  }

  downloadAll() {
    this.operationsService.download();
  }

  async addTags() {
    const modal = await this.modalService.getModal(AddTagComponent, 'auto-height', true);
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.filterService.addTags(data.data);
      }
    });
    await modal.present();
  }
}
