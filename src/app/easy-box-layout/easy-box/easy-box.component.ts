import { Component, Input, Renderer2, ElementRef, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Position } from './position';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';

import { EasyBoxLayoutService } from '../easy-box-layout.service';

@Component({
  selector: 'ez-box',
  templateUrl: './easy-box.component.html',
  styleUrls: ['./easy-box.component.scss']
})
export class EasyBoxComponent implements OnDestroy {

  @Input() width: string;
  @Input() height: string;

  @HostBinding('style.height.px') heightPx: number;
  @HostBinding('style.width.px') widthPx: number;
  @HostBinding('style.top.px') topPx: number;
  @HostBinding('style.left.px') leftPx: number;
  @HostBinding('style.visibility') visibility = 'visible';

  private startEvent: MouseEvent | TouchEvent;
  private dragStartSubscription: Subscription;
  private dragSubscription: Subscription;
  private dragEndSubscription: Subscription;

  constructor(
    private layoutService: EasyBoxLayoutService,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2) {
    this.dragEvents();
  }

  ngOnDestroy() {
    this.dragStartSubscription.unsubscribe();
    this.dragSubscription.unsubscribe();
    this.dragEndSubscription.unsubscribe();
  }

  private dragEvents() {
    this.dragStartSubscription = Observable.merge(
      Observable.fromEvent(this.elementRef.nativeElement, 'mousedown'),
      Observable.fromEvent(this.elementRef.nativeElement, 'touchstart'))
      .subscribe((e: MouseEvent | TouchEvent) => {
        this.startEvent = e;
        this.onDragStart(e);
      });
    this.dragSubscription = Observable.merge(
      Observable.fromEvent(document, 'mousemove'),
      Observable.fromEvent(document, 'touchmove'))
      .filter(_ => this.startEvent != null)
      .subscribe((e: MouseEvent | TouchEvent) => {
        this.onDragging(e);
      });
    this.dragEndSubscription = Observable.merge(
      Observable.fromEvent(document, 'mouseup'),
      Observable.fromEvent(document, 'touchend'))
      .filter(_ => this.startEvent != null)
      .subscribe((e: MouseEvent | TouchEvent) => {
        this.startEvent = null;
        this.onDragEnd(e);
      });
  }

  private onDragStart(e: MouseEvent | TouchEvent) {
    this.renderer.addClass(this.elementRef.nativeElement, 'dragging');
  }

  private onDragging(e: MouseEvent | TouchEvent) {
    const position = this.calculatePosition(e);
    this.renderer.setStyle(this.elementRef.nativeElement, 'transform', `translate3d(${position.left}px, ${position.top}px, 0)`);
  }

  private onDragEnd(e: MouseEvent | TouchEvent) {
    this.renderer.removeStyle(this.elementRef.nativeElement, 'transform');
    this.renderer.setStyle(this.elementRef.nativeElement, 'transition', `transform ${this.layoutService.animation}ms`);
    setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'dragging');
      this.renderer.removeStyle(this.elementRef.nativeElement, 'transition');
    }, this.layoutService.animation);
  }

  private getPosition(e: MouseEvent | TouchEvent): Position {
    if (e instanceof MouseEvent) {
      const event: MouseEvent = this.startEvent as MouseEvent;
      return {
        top: e.pageY - event.pageY,
        left: e.pageX - event.pageX
      };
    } else if (e instanceof TouchEvent) {
      const event = this.startEvent as TouchEvent;
      return {
        top: e.changedTouches[0].pageY - event.changedTouches[0].pageY,
        left: e.changedTouches[0].pageX - event.changedTouches[0].pageX,
      };
    }
  }

  private calculatePosition(e: MouseEvent | TouchEvent): Position {
    const position: Position = this.getPosition(e);
    if (this.layoutService.lockInsideParent) {
      // top
      const elementOffsetTop = this.elementRef.nativeElement.offsetTop;
      if (position.top + elementOffsetTop < 0) {
        position.top = (elementOffsetTop * -1);
      }
      // bottom
      const elementOffsetHeight = this.elementRef.nativeElement.offsetHeight + elementOffsetTop;
      const parentOffsetHeight = this.layoutService.containerRef.nativeElement.offsetHeight;
      if (position.top + elementOffsetHeight > parentOffsetHeight) {
        position.top = parentOffsetHeight - elementOffsetHeight;
      }
      // left
      const elementOffsetLeft = this.elementRef.nativeElement.offsetLeft;
      if (position.left + elementOffsetLeft < 0) {
        position.left = (elementOffsetLeft * -1);
      }
      // right
      const elementOffsetWidth = this.elementRef.nativeElement.offsetWidth + elementOffsetLeft;
      const parentOffsetWidth = this.layoutService.containerRef.nativeElement.offsetWidth;
      if (position.left + elementOffsetWidth > parentOffsetWidth) {
        position.left = parentOffsetWidth - elementOffsetWidth;
      }
    }
    return position;
  }
}
