import {Injectable} from '@angular/core';
import {catchError, map, Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment.prod";
import {IWorldList} from "../../../shared/models/repsonse/IWorldList";
import {World} from "../../../shared/models/World";
import {IWorld} from "../../../shared/models/repsonse/IWorld";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {IWorldCreate} from "../../../shared/models/repsonse/IWorldCreate";
import {IStatus} from "../../../shared/models/repsonse/IStatus";
import {OperationEntry} from "../../../shared/models/OperationEntry";
import {ITextResponse} from "../../../shared/models/repsonse/ITextResponse";
import {IWorldCreateStatus} from "../../../shared/models/repsonse/IWorldCreateStatus";
import {OperationsService} from "../../../shared/services/operations/operations.service";

@Injectable({
  providedIn: 'root'
})
export class WorldService {

  private worldFormData: FormData

  private worldDeletedSubject: Subject<void>;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private loadContentService: LoadContentService,
  ) {
    this.worldFormData = new FormData();
    this.worldDeletedSubject = new Subject<void>();
  }

  get worldDeleted$(): Observable<void> {
    return this.worldDeletedSubject.asObservable();
  }

  getAll(): Observable<World[]> {
    this.loadContentService.isLoading = true;
    return this.http.get<IWorldList>(`${environment.deeprealmsAPI}worlds/list`).pipe(
      map((response: IWorldList) => {
        return response.data.worlds.map((world: IWorld) => {
            return new World(world.world_id, world.world_name, new Date(world.created_on), [], false);
          }
        );
      }),
      catchError(() => {
        this.toastService.showToast("Couldn't retrieve data. Check your API Key", 'danger', 2500, "bottom");
        return [];
      })
    );
  }

  getText(id: string | number): Observable<ITextResponse> {
    return this.http.get<ITextResponse>(`${environment.deeprealmsAPI}worlds/text?world_id=${id}`);
  }

  getCreationStatus(uid: string | number): Observable<IWorldCreateStatus> {
    return this.http.get<IWorldCreateStatus>(`${environment.deeprealmsAPI}worlds/create/status?world_id=${uid}`);
  }

  create(worldName: string, worldText: string): Observable<IWorldCreate> {
    this.fillFormData(['world_name', 'world_text'], [worldName, worldText]);
    return this.http.post<IWorldCreate>(`${environment.deeprealmsAPI}worlds/create`, this.worldFormData);
  }

  delete(crudEntries: OperationEntry[], index: number): void {
    this.http.post<IStatus>(`${environment.deeprealmsAPI}worlds/delete?world_id=${crudEntries[index].id}`, null).subscribe({
      next: (status: IStatus) => {
        if (status.success) {
          if (crudEntries.length > index + 1) {
            this.delete(crudEntries, ++index);
          } else {
            this.toastService.showToast('💥' + crudEntries.length + ' Worlds are deleted', 'success', 2500, "bottom").then(() =>
              this.worldDeletedSubject.next()
            );
          }
        } else {
          this.toastService.showToast('☄️Worlds could not be deleted', 'danger', 2500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private fillFormData(keys: string[], values: string[]) {
    this.worldFormData = new FormData();
    keys.forEach((label: string, index: number) => {
      this.worldFormData.append(label, values[index])
    })
  }
}
