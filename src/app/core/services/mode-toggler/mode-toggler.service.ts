import {Injectable} from '@angular/core';
import {LocalstorageService} from "../../../shared/services/localstorage/localstorage.service";

@Injectable({
  providedIn: 'root'
})
export class ModeTogglerService {

  constructor(private _localstorageService: LocalstorageService) {
    this._darkMode = true;
  }

  private _darkMode: boolean

  get darkMode(): boolean {
    return this._darkMode;
  }

  checkModeAndLoadIt() {
    if (this._localstorageService.get('darkMode') === false) {
      this._darkMode = false;
    } else {
      if (this._localstorageService.get('darkMode')) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this._darkMode = true;
        } else {
          this._darkMode = false;
        }
      }
    }
    this.setDarkMode(this._darkMode);
  }

  setDarkMode(mode: boolean) {
    this._darkMode = mode;
    this._localstorageService.save('darkMode', mode);
    document.body.classList.toggle('dark', mode);
  }
}
