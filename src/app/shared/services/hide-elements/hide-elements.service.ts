import { Injectable } from '@angular/core';
import {Platform} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class HideElementsService {

  constructor(private platform: Platform) {}

  isMobile(): boolean{
    return this.platform.width() < 1291;
  }
}
