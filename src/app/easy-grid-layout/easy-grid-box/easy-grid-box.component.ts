import { Component, OnInit, Input, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Position } from '../directives/drag.directive';

import { EasyGridLayoutService } from '../easy-grid-layout.service';
import { Utils, Format } from '../util/utils.class';

@Component({
  selector: 'ez-grid-box',
  templateUrl: './easy-grid-box.component.html',
  styleUrls: ['./easy-grid-box.component.scss']
})
export class EasyGridBoxComponent implements OnInit {

  @Input() width: string;
  @Input() height: string;

  @ViewChild('box') box: ElementRef;

  public _width: number;
  public _height: number;
  public _top: number;
  public _left: number;

  constructor(
    private layoutService: EasyGridLayoutService,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2) { }

  ngOnInit() { }

  public onDragStart() {
    this.renderer.addClass(this.box.nativeElement, 'dragging');
  }

  public onDragging(event: Position) {
    this.renderer.setStyle(this.box.nativeElement, 'transform', `translate3d(${event.left}px, ${event.top}px, 0)`);
  }

  public onDragEnd() {
    this.renderer.removeStyle(this.box.nativeElement, 'transform');
    this.renderer.setStyle(this.box.nativeElement, 'transition', `transform ${this.layoutService.animation}ms`);
    setTimeout(() => {
      this.renderer.removeClass(this.box.nativeElement, 'dragging');
      this.renderer.removeStyle(this.box.nativeElement, 'transition');
    }, this.layoutService.animation);
  }
}
