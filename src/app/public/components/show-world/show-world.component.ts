import {Component, Input, OnInit} from '@angular/core';
import {ModalService} from "../../../shared/services/modal/modal.service";
import {WorldService} from "../../../core/http/world/world.service";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {World} from "../../../shared/models/World";
import {Subscription} from "rxjs";
import {ITextResponse} from "../../../shared/models/repsonse/ITextResponse";

@Component({
  selector: 'app-show-world',
  templateUrl: './show-world.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ShowWorldComponent implements OnInit {

  @Input({required: true}) content: World;

  textSubscription: Subscription;
  text: string;

  constructor(
    public modalService: ModalService,
    private worldService: WorldService
  ) {
    this.textSubscription = new Subscription();
    this.content = new World(0, '', new Date(), [], false);
    this.text = '';
  }

  ngOnInit() {
    this.textSubscription = this.worldService.getText(this.content.id).subscribe({
      next: ((response: ITextResponse) => {
        this.text = response.data.world_text;
      })
    })
  }
}
