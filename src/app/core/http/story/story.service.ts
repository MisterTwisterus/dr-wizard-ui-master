import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, Subject} from "rxjs";
import {environment} from "../../../../environments/environment.prod";
import {Story} from "../../../shared/models/Story";
import {IStory} from "../../../shared/models/repsonse/IStory";
import {IStoryResponse} from "../../../shared/models/repsonse/IStoryResponse";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {ITextResponse} from "../../../shared/models/repsonse/ITextResponse";
import {OperationEntry} from "../../../shared/models/OperationEntry";
import {IStatus} from "../../../shared/models/repsonse/IStatus";
import {LoadContentService} from "../../../shared/services/load-content-service/load-content.service";
import {IStoryCreate} from "../../../shared/models/repsonse/IStoryCreate";
import {World} from "../../../shared/models/World";
import {ISettings} from "../../../shared/models/repsonse/ISettings";
import {ModelTypes} from "../../../shared/models/types/ModelTypes";
import {IGenerateStatus} from "../../../shared/models/repsonse/IGenerateStatus";

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  private storyFormData: FormData;

  private storyDeletedSubject: Subject<void>;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private loadContentService: LoadContentService
  ) {
    this.storyFormData = new FormData();
    this.storyDeletedSubject = new Subject<void>();
  }

  get storyDeleted$(): Observable<void> {
    return this.storyDeletedSubject.asObservable();
  }

  getAll(): Observable<Story[]> {
    this.loadContentService.isLoading = true;
    return this.http.get<IStoryResponse>(`${environment.deeprealmsAPI}stories/list`).pipe(
      map((response: IStoryResponse) => {
        return response.data.stories.map((story: IStory) => {
            return new Story(story.story_id, story.story_name, new Date(story.created_on), story.world_name, story.world_id, [], false);
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
    return this.http.get<ITextResponse>(`${environment.deeprealmsAPI}stories/text?story_id=${id}`);
  }

  create(storyName: string, worldId: World): Observable<IStoryCreate> {
    this.fillFormData(['story_name', 'world_id'], [storyName, worldId.id.toString()]);
    return this.http.post<IStoryCreate>(`${environment.deeprealmsAPI}stories/create`, this.storyFormData);
  }

  addText(id: string | number, text: string): Observable<IStatus> {
    this.fillFormData(['text'], [text]);
    return this.http.post<IStatus>(`${environment.deeprealmsAPI}stories/add-text?story_id=${id}`, this.storyFormData);
  }

  updateText(id: string | number, name: string): Observable<IStatus> {
    this.fillFormData(['new_name'], [name]);
    return this.http.post<IStatus>(`${environment.deeprealmsAPI}stories/rename?story_id=${id}`, this.storyFormData);
  }

  getEditableText(id: string | number) {
    return this.http.get<ITextResponse>(`${environment.deeprealmsAPI}stories/editable-text?story_id=${id}`);
  }

  updateEditableText(id: string | number, editableText: string) {
    this.fillFormData(['editable_text'], [editableText]);
    return this.http.post<IStatus>(`${environment.deeprealmsAPI}stories/editable-text?story_id=${id}`, this.storyFormData);
  }

  updateSettings(
    id: string | number,
    modelName: ModelTypes,
    action: string,
    authorNote: string,
    memorySection: string,
    nsfw: boolean,
    adventureMode: boolean,
    automaticGuidelines: boolean,
    automaticMemory: boolean,
    maxOutputLength: number,
    numberOfGenerations: number
  ) {
    this.fillFormData(
      ['model_name', 'action', 'authors_note', 'memory_section', 'nsfw', 'adventure_mode', 'automatic_guidelines', 'automatic_memory', 'max_output_length', 'number_of_generations'],
      [modelName, action, authorNote, memorySection, nsfw.toString(), adventureMode.toString(), automaticMemory.toString(), automaticGuidelines.toString(), maxOutputLength.toString(), numberOfGenerations.toString()]
    );
    return this.http.post<IStatus>(`${environment.deeprealmsAPI}stories/save-settings?story_id=${id}`, this.storyFormData);
  }

  getSettings(id: string | number) {
    return this.http.get<ISettings>(`${environment.deeprealmsAPI}stories/get-settings?story_id=${id}`);
  }

  getGenerationStatus(id: string | number) {
    return this.http.get<IGenerateStatus>(`${environment.deeprealmsAPI}stories/generate-text/status?story_id=${id}`);
  }

  startGeneration(
    id: string | number,
    modelName: ModelTypes,
    action: string,
    authorNote: string,
    memorySection: string,
    nsfw: boolean,
    adventureMode: boolean,
    automaticGuidelines: boolean,
    automaticMemory: boolean,
    maxOutputLength: number,
    numberOfGenerations: number) {
    this.fillFormData(
      ['model_name', 'action', 'authors_note', 'memory_section', 'nsfw', 'adventure_mode', 'automatic_guidelines', 'automatic_memory', 'max_output_length', 'number_of_generations'],
      [modelName, action, authorNote, memorySection, nsfw.toString(), adventureMode.toString(), automaticGuidelines.toString(), automaticMemory.toString(), maxOutputLength.toString(), numberOfGenerations.toString()]
    );
    return this.http.post<IStatus>(`${environment.deeprealmsAPI}stories/generate-text?story_id=${id}`, this.storyFormData);
  }

  delete(crudEntries: OperationEntry[], index: number): void {
    this.http.post<IStatus>(`${environment.deeprealmsAPI}stories/delete?story_id=${crudEntries[index].id}`, null).subscribe({
      next: (status: IStatus) => {
        if (status.success) {
          if (crudEntries.length > index + 1) {
            this.delete(crudEntries, ++index);
          } else {
            this.storyDeletedSubject.next();
            this.toastService.showToast('💥' + crudEntries.length + ' Stories are deleted', 'success', 2500, "bottom").then(() => {
            });
          }
        } else {
          this.toastService.showToast('☄️Stories could not be deleted', 'danger', 2500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private fillFormData(keys: string[], values: string[]) {
    this.storyFormData = new FormData();
    keys.forEach((label: string, index: number) => {
      this.storyFormData.append(label, values[index])
    })
  }
}
