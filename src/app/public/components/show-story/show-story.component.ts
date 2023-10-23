import {Component, Input, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ModalService} from "../../../shared/services/modal/modal.service";
import {ITextResponse} from "../../../shared/models/repsonse/ITextResponse";
import {Story} from "../../../shared/models/Story";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {StoryService} from "../../../core/http/story/story.service";

@Component({
  selector: 'app-show-story',
  templateUrl: './show-story.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShowStoryComponent implements OnInit {

  @Input({required: true}) content: Story;

  textSubscription: Subscription;
  text: string;

  constructor(
    public modalService: ModalService,
    private storyService: StoryService
  ) {
    this.textSubscription = new Subscription();
    this.content = new Story(0, '', new Date(), '', 0, [], false);
    this.text = '';
  }

  ngOnInit() {
    this.textSubscription = this.storyService.getText(this.content.id).subscribe({
      next: ((response: ITextResponse) => {
        this.text = response.data.story_text;
      })
    })
  }

}
