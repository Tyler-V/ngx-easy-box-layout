import { Component, OnInit, Input, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DragEvent } from '../directives/drag.directive';

import { EasyGridLayoutService } from '../easy-grid-layout.service';

@Component({
  selector: 'ez-grid-box',
  templateUrl: './easy-grid-box.component.html',
  styleUrls: ['./easy-grid-box.component.scss']
})
export class EasyGridBoxComponent implements OnInit {

  @Input() width: number | string;
  @Input() height: number | string;
  @Input() top: number;
  @Input() left: number;

  @ViewChild('box') box: ElementRef;

  constructor(private layoutService: EasyGridLayoutService,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2) { }

  ngOnInit() { }

  onDrag(event: DragEvent) {
    this.renderer.setStyle(this.box.nativeElement, 'transform', `translate3d(${event.left}px, ${event.top}px, 0)`);
  }

  onDragEnd() {
    this.renderer.removeStyle(this.box.nativeElement, 'transform');
    this.renderer.setStyle(this.box.nativeElement, 'transition', `transform ${this.layoutService.animation}ms`);
    setTimeout(() => {
      this.renderer.removeStyle(this.box.nativeElement, 'transition');
    }, this.layoutService.animation);
  }
}
