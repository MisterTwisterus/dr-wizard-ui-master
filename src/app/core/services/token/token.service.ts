import {Injectable} from '@angular/core';
import {LocalstorageService} from "../../../shared/services/localstorage/localstorage.service";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private _localstorageService: LocalstorageService) {
    this._token = '';
  }

  private _token: string

  get token(): string {
    return this._token;
  }

  checkTokenAndLoadIt() {
    if (this._localstorageService.get('token')) {
      this._token = this._localstorageService.get('token') as string;
    }
  }

  setToken(token: string) {
    this._token = token;
    this._localstorageService.save('token', token);
  }
}
