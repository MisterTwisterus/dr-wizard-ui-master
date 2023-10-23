import {Component, Input, ViewChild} from '@angular/core';
import {IonicModule, ModalController} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {Story} from "../../../shared/models/Story";
import {Subscription} from "rxjs";
import {StoryService} from "../../../core/http/story/story.service";
import {ISettings} from "../../../shared/models/repsonse/ISettings";
import {ITextResponse} from "../../../shared/models/repsonse/ITextResponse";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {ToastService} from "../../../shared/services/toast/toast.service";
import {IStatus} from "../../../shared/models/repsonse/IStatus";
import {IGenerateStatus} from "../../../shared/models/repsonse/IGenerateStatus";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthorsNote} from "../../../shared/models/AuthorsNote";
import {Character} from "../../../shared/models/Character";
import {WorldEvent} from "../../../shared/models/WorldEvent";
import {StorageService} from "../../../core/services/storage/storage.service";
import {IonicSelectableComponent} from "ionic-selectable";
import {SettingsTypes} from "../../../shared/models/types/SettingsTypes";
import {HideElementsService} from "../../../shared/services/hide-elements/hide-elements.service";
import {PlayTypes} from "../../../shared/models/types/PlayTypes";
import {AutoSizeDirective} from "../../../shared/directives/auto-size.directive";

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CKEditorModule, ReactiveFormsModule, IonicSelectableComponent, AutoSizeDirective]
})
export class PlayComponent {
  @Input({required: true}) story: Story;
  settingsSubscription: Subscription;
  textSubscription: Subscription;
  editableTextSubscription: Subscription;
  text: string;
  notEditableText: string;
  editableText: string;
  playForm: FormGroup;
  action: string;
  lastAction: string;
  lastGeneratedText: string;
  isGenerating: boolean;
  authorNotes: AuthorsNote[];
  characters: Character[];
  worldEvents: WorldEvent[];
  settingsType: SettingsTypes;
  playType: PlayTypes;
  @ViewChild('content') private content: any;
  @ViewChild('editable') private editable: any;

  constructor(
    public modalService: ModalService,
    public hideElementsService: HideElementsService,
    private storyService: StoryService,
    private modalController: ModalController,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private storageService: StorageService
  ) {
    this.authorNotes = [];
    this.characters = [];
    this.worldEvents = [];
    this.settingsSubscription = new Subscription();
    this.textSubscription = new Subscription();
    this.editableTextSubscription = new Subscription();
    this.story = new Story(0, '', new Date(), '', 0, [], false);
    this.action = '';
    this.lastAction = '';
    this.text = '';
    this.editableText = '';
    this.notEditableText = '';
    this.lastGeneratedText = '';
    this.content = null;
    this.editable = null;
    this.isGenerating = false;
    this.settingsType = 'author';
    this.playType = 'play';
    this.playForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      note: [''],
      memory: [''],
      nsfw: [false, [Validators.required]],
      selectedAuthorNotes: [[]],
      selectedCharacters: [[]],
      selectedWorldEvents: [[]],
      isAdventure: [false, [Validators.required]],
      hasAutomaticMemory: [false, [Validators.required]],
      hasAutomaticGuidelines: [false, [Validators.required]],
      maxOutputLength: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      numberOfGenerations: [1, [Validators.required, Validators.max(300)]]
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.loadCharacters();
    this.loadAuthorNotes();
    this.loadWorldEvents();
    this.checkIfIsCreated(this.story.id);
  }

  scrollToBottom() {
    this.content.scrollToBottom(300);
  }

  setPlay() {
    this.playType = 'settings';
    this.scrollToBottom();
  }

  async send() {
    this.isGenerating = true;
    this.editableText = this.editable.nativeElement.innerHTML;
    this.storyService.updateEditableText(this.story.id, this.editableText).subscribe({
      next: (response: IStatus) => {
        if (response) {
          setTimeout(() => {
          }, 1000);
          this.storyService.startGeneration(
            this.story.id,
            this.playForm.get('name')?.value,
            this.action,
            this.playForm.get('note')?.value,
            this.playForm.get('memory')?.value,
            this.playForm.get('nsfw')?.value,
            this.playForm.get('isAdventure')?.value,
            this.playForm.get('hasAutomaticMemory')?.value,
            this.playForm.get('hasAutomaticGuidelines')?.value,
            this.playForm.get('maxOutputLength')?.value,
            this.playForm.get('numberOfGenerations')?.value
          ).subscribe({
            next: (response: IStatus) => {
              if (response) {
                this.lastAction = this.action;
                this.action = '';
                this.checkIfIsCreated(this.story.id);
              } else {
                this.toastService.showToast("Couldn't get text", 'warning', 1500, "bottom")
              }
            },
            error: (error: HttpErrorResponse) => {
              if (error.status === 409) {
                this.toastService.showToast('🙃Too much story text added in a single step', 'warning', 2500, "bottom")
              } else {
                this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
              }
              this.isGenerating = false;
            }
          });
        } else {
          this.toastService.showToast("Couldn't save editable text", 'warning', 1500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  save() {
    this.isGenerating = true;
    this.storyService.updateSettings(
      this.story.id,
      this.playForm.get('name')?.value,
      '',
      this.playForm.get('note')?.value,
      this.playForm.get('memory')?.value,
      this.playForm.get('nsfw')?.value,
      this.playForm.get('isAdventure')?.value,
      this.playForm.get('hasAutomaticMemory')?.value,
      this.playForm.get('hasAutomaticGuidelines')?.value,
      this.playForm.get('maxOutputLength')?.value,
      this.playForm.get('numberOfGenerations')?.value
    ).subscribe({
      next: (response: IStatus) => {
        if (response) {
          this.loadSettings();
          this.isGenerating = false;
          this.toastService.showToast('Settings updated', 'success', 1500, "bottom")
        } else {
          this.toastService.showToast("Couldn't update Settings", 'warning', 1500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  regenerate(){
    this.isGenerating = true;
    this.editableText = this.editable.nativeElement.innerHTML.toString().slice(0, -(this.lastGeneratedText.length));;
    this.storyService.updateEditableText(this.story.id, this.editableText).subscribe({
      next: (response: IStatus) => {
        if (response) {
          setTimeout(() => {
          }, 1000);
          this.storyService.startGeneration(
            this.story.id,
            this.playForm.get('name')?.value,
            this.lastAction,
            this.playForm.get('note')?.value,
            this.playForm.get('memory')?.value,
            this.playForm.get('nsfw')?.value,
            this.playForm.get('isAdventure')?.value,
            this.playForm.get('hasAutomaticMemory')?.value,
            this.playForm.get('hasAutomaticGuidelines')?.value,
            this.playForm.get('maxOutputLength')?.value,
            this.playForm.get('numberOfGenerations')?.value
          ).subscribe({
            next: (response: IStatus) => {
              if (response) {
                this.lastAction = this.lastAction;
                this.action = '';
                this.checkIfIsCreated(this.story.id);
              } else {
                this.toastService.showToast("Couldn't get text", 'warning', 1500, "bottom")
              }
            },
            error: (error: HttpErrorResponse) => {
              if (error.status === 409) {
                this.toastService.showToast('🙃Too much story text added in a single step', 'warning', 2500, "bottom")
              } else {
                this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
              }
              this.isGenerating = false;
            }
          });
        } else {
          this.toastService.showToast("Couldn't save editable text", 'warning', 1500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private textAnimation(text: string, index: number) {
    setTimeout(() => {
      this.editableText = this.editableText + text.charAt(index);
      if (text.length >= index) {
        this.textAnimation(text, index + 1)
      } else {
        this.isGenerating = false;
        this.loadText();
      }
    }, 5);
  }

  addSelectedText(type: 'note' | 'characters' | 'event') {
    if(type === 'note'){
      (this.playForm.get('selectedAuthorNotes')?.value as AuthorsNote[]).forEach((item: any | Character | WorldEvent | AuthorsNote) => {
        this.playForm.get('note')?.setValue(this.playForm.get('note')?.value + '\n' + item.description + '\n' );
      });
      this.playForm.get('selectedAuthorNotes')?.setValue([]);
    } else if (type === 'characters'){
      (this.playForm.get('selectedCharacters')?.value as Character[]).forEach((item: any | Character | WorldEvent | AuthorsNote) => {
        this.playForm.get('memory')?.setValue(this.playForm.get('memory')?.value + '\n' + item.description + '\n' );
      });
      this.playForm.get('selectedCharacters')?.setValue([]);
    } else if ('event') {
      (this.playForm.get('selectedWorldEvents')?.value as WorldEvent[]).forEach((item: any | Character | WorldEvent | AuthorsNote) => {
        this.playForm.get('memory')?.setValue(this.playForm.get('memory')?.value + '\n' + item.description + '\n' );
      });
      this.playForm.get('selectedWorldEvents')?.setValue([]);
    }
  }

  private checkIfIsCreated(uid: string | number) {
    this.storyService.getGenerationStatus(uid).subscribe({
      next: (response: IGenerateStatus) => {
        if (response.success) {
          if (response.data.finished) {
            this.toastService.showToast('🤖Text generated', 'success', 2500, "bottom").then(
              () => {
                this.isGenerating = false;
                this.lastGeneratedText = response.data.generated_text;
                this.textAnimation(response.data.generated_text, 0)
              });
          } else {
            this.toastService.showToast('📎Text is still generating', 'tertiary', 5500, "bottom").then(() => {
              setTimeout(() => this.checkIfIsCreated(uid), 5000)
            })
          }
        } else {
          this.toastService.showToast('💥World could not be created', 'danger', 2500, "bottom")
        }
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 409){
          this.loadText();
        } else {
          this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
        }
      }
    });
  }

  private loadSettings() {
    this.settingsSubscription = this.storyService.getSettings(this.story.id).subscribe({
      next: (response: ISettings) => {
        if (response.success) {
          this.playForm.get('name')?.setValue(response.data.model_name);
          this.playForm.get('note')?.setValue(response.data.authors_note);
          this.playForm.get('memory')?.setValue(response.data.memory_section);
          this.playForm.get('nsfw')?.setValue(response.data.nsfw);
          this.playForm.get('isAdventure')?.setValue(response.data.adventure_mode);
          this.playForm.get('hasAutomaticMemory')?.setValue(response.data.automatic_memory);
          this.playForm.get('hasAutomaticGuidelines')?.setValue(response.data.automatic_guidelines);
          this.playForm.get('maxOutputLength')?.setValue(response.data.max_output_length == null ? 5 : response.data.max_output_length);
          this.playForm.get('numberOfGenerations')?.setValue(response.data.number_of_generations < 0 ? 1 : response.data.number_of_generations);
        } else {
          this.toastService.showToast("Couldn't get settings", 'warning', 1500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private loadText() {
    this.textSubscription = this.storyService.getText(this.story.id).subscribe({
      next: (response: ITextResponse) => {
        if (response) {
          this.text = response.data.story_text;
          this.loadEditableText();
        } else {
          this.toastService.showToast("Couldn't get text", 'warning', 1500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private loadEditableText() {
    this.editableTextSubscription = this.storyService.getEditableText(this.story.id).subscribe({
      next: (response: ITextResponse) => {
        if (response) {
          this.editableText = response.data.editable_text;
          this.notEditableText = this.text.toString().slice(0, -(this.editableText.length));
          this.scrollToBottom();
        } else {
          this.toastService.showToast("Couldn't get editable text", 'warning', 1500, "bottom")
        }
      },
      error: () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    });
  }

  private loadAuthorNotes() {
    this.storageService.getAll().then(
      response => {
        this.authorNotes = response.filter(value => value.type === 'author-note')
      },
      () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    )
  }

  private loadCharacters() {
    this.storageService.getAll().then(
      response => {
        this.characters = response.filter(value => value.type === 'character')
      },
      () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    )
  }

  private loadWorldEvents() {
    this.storageService.getAll().then(
      response => {
        this.worldEvents = response.filter(value => value.type === 'world-event')
      },
      () => this.toastService.showToast('🙃Unexpected error happened', 'danger', 2500, "bottom")
    )
  }
}
