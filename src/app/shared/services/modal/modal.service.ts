import {Injectable} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modal?: Promise<HTMLIonModalElement>;

  constructor(private modalController: ModalController, private router: Router) {
  }

  async getModal(component: any, cssClass: string, backdropDismiss: boolean, componentProps?: any,): Promise<HTMLIonModalElement> {
    this.router.events.subscribe(async () => {
      const isModalOpened = await this.modalController.getTop();
      if (isModalOpened) this.closeModal();
    });
    this.modal = this.modalController.create({
      component,
      animated: true,
      componentProps,
      backdropDismiss,
      mode: 'md',
      cssClass,
      keyboardClose: true,
    });
    return this.modal;
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
