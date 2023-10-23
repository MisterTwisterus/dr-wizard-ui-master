import {Injectable} from '@angular/core';
import {ToastController} from "@ionic/angular";
import {PredefinedColors} from '@ionic/core/dist/types/interface'

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toast: HTMLIonToastElement | undefined;

  constructor(
    private toastController: ToastController
  ) {
  }

  async showToast(message: string, color: PredefinedColors, duration: number, position: 'top' | 'bottom' | 'middle'): Promise<void> {
    this.toast = await this.toastController.create({
      message,
      color,
      duration,
      position
    });
    await this.toast.present();
  }
}
