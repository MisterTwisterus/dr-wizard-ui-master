import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  get(key: string): string | null | boolean {
    let value: string | null | boolean;
    value = '';
    if (localStorage.getItem(key)) {
      value = localStorage.getItem(key)
    }
    if (value) {
      try {
        const data = JSON.parse(value);
        return data;
      } catch (e) {
        console.error(e);
        return null;
      }
    } else {
      return null;
    }
  }

  save(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
