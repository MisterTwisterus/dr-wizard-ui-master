import {Injectable} from '@angular/core';

import {Storage} from '@ionic/storage-angular';
import {ToastService} from "../../../shared/services/toast/toast.service";
import {ModalService} from "../../../shared/services/modal/modal.service";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private toastService: ToastService, private modalService: ModalService) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  set(key: string, value: any): Promise<any> | undefined {
    return this._storage?.set(key, value);
  }

  get(key: string): Promise<any> | undefined {
    return this._storage?.get(key);
  }

  remove(key: string): Promise<any> | undefined {
    return this._storage?.remove(key);
  }

  clear() {
    return this._storage?.clear();
  }

  getAllKeys() {
    return this._storage?.keys();
  }

  getAll(): Promise<Awaited<any>[]> {
    return this.storage.keys().then(keys => Promise.all(keys.map(k => this.storage.get(k))));
  }
}
