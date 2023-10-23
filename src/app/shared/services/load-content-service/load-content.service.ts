import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadContentService {

  private _isLoading = false;

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
  }
}
