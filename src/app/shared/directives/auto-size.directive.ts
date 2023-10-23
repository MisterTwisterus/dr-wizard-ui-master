import {Directive, ElementRef, HostListener, OnInit} from '@angular/core';

@Directive({
  selector: 'ion-textarea[autosize]',
  standalone: true
})
export class AutoSizeDirective implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput():void {
    this.adjust();
  }

  constructor(public element:ElementRef) {
  }

  ngOnInit():void {
    setTimeout(() => this.adjust(), 0);
  }

  adjust():void {
    let textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    if(textArea){
      textArea.style.height = 'auto';
      if (textArea.scrollHeight < 300) {
        textArea.style.height = textArea.scrollHeight + "px";
        textArea.style.overflowY = 'hidden';
      } else {
        textArea.style.height = "300px";
        textArea.style.overflowY = 'auto';
      }
    }
  }
}
