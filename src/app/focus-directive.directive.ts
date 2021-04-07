import { Directive, OnInit, Input, ElementRef } from "@angular/core";

@Directive({selector: '[focuMe]'})
export class FocusDirectiveDirective implements OnInit {

  @Input('focuMe') isFocused: boolean;

  constructor(private hostElement: ElementRef) {
  }

  ngOnInit() {
    if (this.isFocused) {
      this.hostElement.nativeElement.focus();
    }
  }
}