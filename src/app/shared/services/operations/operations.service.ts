import {Injectable} from '@angular/core';
import {OperationEntry} from "../../models/OperationEntry";
import {DataTypes} from "../../models/types/DataTypes";
import {Router} from "@angular/router";
import {WorldService} from "../../../core/http/world/world.service";
import {saveAs} from '@progress/kendo-file-saver';
import * as JSZip from 'jszip';
import {Observable, Subject, Subscription} from "rxjs";
import {ITextResponse} from "../../models/repsonse/ITextResponse";
import {ToastService} from "../toast/toast.service";
import {StoryService} from "../../../core/http/story/story.service";
import {StorageService} from "../../../core/services/storage/storage.service";
import {ModalService} from "../modal/modal.service";
import {Tag} from "../../models/Tag";

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  private operationsEntries: OperationEntry[];

  private getTextSubscription

  private jsZip: JSZip;
  private operationCompletedSubject: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private worldService: WorldService,
    private storyService: StoryService,
    private modalService: ModalService,
    private storageService: StorageService,
    private toastService: ToastService,
  ) {
    this._isNotTagsPage = true;
    this.getTextSubscription = new Subscription();
    this.jsZip = new JSZip();
    this.operationsEntries = [];
    router.events.subscribe(() => {
      this._isNotTagsPage = router.url.split('/').pop() !== 'tags';
      this.clearCrudEntry();
    });
  }

  private _isNotTagsPage;

  get isNotTagsPage() {
    return this._isNotTagsPage;
  }

  get operationCompleted$(): Observable<void> {
    return this.operationCompletedSubject.asObservable();
  }

  addOperationEntry(id: string | number, name: string, dataType: DataTypes) {
    this.operationsEntries.push(new OperationEntry(id, name, dataType))
  }

  removeOperationEntry(id: string | number) {
    this.operationsEntries = this.operationsEntries.filter((entry: OperationEntry) => {
      return entry.id !== id;
    });
  }

  hasElementsInEntries(): boolean {
    return this.operationsEntries.length !== 0;
  }

  getEntriesType(): DataTypes {
    return this.operationsEntries[0].type;
  }

  manageCrudEntry(uid: string | number, name: string, dataType: DataTypes, isSelected: boolean) {
    if (isSelected) {
      this.addOperationEntry(uid, name, dataType)
    } else {
      this.removeOperationEntry(uid);
    }
  }

  clearCrudEntry() {
    this.operationsEntries = [];
  }

  delete() {
    switch (this.operationsEntries[0].type) {
      case "world":
        this.worldService.delete(this.operationsEntries, 0);
        break;
      case "story":
        this.storyService.delete(this.operationsEntries, 0);
        break;
      default:
        this.operationsEntries.forEach(entry => {
          if (entry.type === 'tags') {
            this.storageService.remove(entry.name);
            this.storageService.getAllKeys()?.then((keys: string[]) => {
              keys.forEach(key => {
                this.storageService.get(key)?.then(value => {
                  if (value.length !== 0) {
                    const updatedValue = value.filter((item: any | unknown) => {
                      return item.id !== entry.id
                    });
                    this.storageService.set(key, updatedValue);
                  }
                })
              })
            })
          } else {
            this.operationsEntries.forEach(entry => {
              this.storageService.remove(entry.type + "_" + entry.name);
            })
          }
          this.removeOperationEntry(entry.id);
          if (this.operationsEntries.length === 0) {
            this.toastService.showToast('💥' + (this.operationsEntries.length + 1) + ' Entries are deleted', 'success', 2500, "bottom").then(() => {
              this.operationCompletedSubject.next();
            })
          }
        });
        break;
    }
    this.clearCrudEntry();
  }


  addTags(type: DataTypes, uid: string | number, tags: Tag[]) {
    this.storageService.set(type + '_' + uid, tags);
  }

  getTags(uid: string | number, type: DataTypes): Promise<any> | undefined {
    return this.storageService.get(type + '_' + uid);
  }

  removeTag(uid: string | number, type: DataTypes) {
    return this.storageService.remove(type + '_' + uid);
  }

  download() {
    this.jsZip = new JSZip();
    this.createFile(this.operationsEntries, 0)
  }

  private createFile(crudEntry: OperationEntry[], index: number) {
    switch (this.operationsEntries[0].type) {
      case "world":
        this.getTextSubscription = this.worldService.getText(this.operationsEntries[index].id).subscribe({
          next: (text: ITextResponse) => {
            if (text.success) {
              this.jsZip.file(crudEntry[index].name + '.txt', text.data.world_text);
              this.saveFile(crudEntry, index);
            } else {
              this.toastService.showToast('☄️Could not get world text', 'danger', 2500, "bottom")
            }
          },
          error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
        });
        break;
      case "story":
        this.getTextSubscription = this.storyService.getText(this.operationsEntries[index].id).subscribe({
          next: (text: ITextResponse) => {
            if (text.success) {
              this.jsZip.file(crudEntry[index].name + '.txt', text.data.story_text);
              this.saveFile(crudEntry, index);
            } else {
              this.toastService.showToast('☄️Could not get story text', 'danger', 2500, "bottom")
            }
          },
          error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
        });
        break;
      case "tags":
        this.storageService.get(crudEntry[index].name)?.then(
          response => {
            if(response) {
              this.jsZip.file(crudEntry[index].name + '.txt', response.color);
            }
            this.saveFile(crudEntry, index);
          });
        break;
      default:
        this.storageService.get(crudEntry[index].type + "_" +crudEntry[index].name)?.then(
          response => {
            if(response) {
              this.jsZip.file(crudEntry[index].name + '.txt', response.description);
            }
            this.saveFile(crudEntry, index);
          });
        break;
    }
  }

  private saveFile(crudEntry: OperationEntry[], index: number) {
    if (crudEntry.length > index + 1) {
      this.createFile(crudEntry, ++index);
    } else {
      this.toastService.showToast('🤩Starting download', 'success', 2500, "bottom").then(() => {
        this.jsZip.generateAsync({type: 'blob'}).then(function (content) {
          saveAs(content, crudEntry[index].type + '.zip');
        });
      });
    }
  }
}
