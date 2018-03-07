import { Component, Input, Renderer2, ElementRef, ViewChild, HostBinding, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Position, ElementPosition } from './position.class';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from "rxjs/Subject";
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';

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
  @HostBinding('style.left.px') leftPx: number;
  @HostBinding('style.top.px') topPx: number;
  @HostBinding('style.display') display: string;
  @HostBinding('style.background-color') backgroundColor: string;

  public index: number;
  public position$ = new Subject<ElementPosition>();

  private animationTimeout;
  private startEvent: MouseEvent | TouchEvent;
  private dragStartSubscription: Subscription;
  private dragSubscription: Subscription;
  private reorderSubscription: Subscription;
  private dragEndSubscription: Subscription;
  private positionSubscription: Subscription;

  constructor(
    public elementRef: ElementRef,
    private layoutService: EasyBoxLayoutService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2) {
    this.dragEvents();
    this.backgroundColor = 'rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ')';
    this.position$.subscribe((position: ElementPosition) => {
      this.animate(position);
    });
  }

  ngOnDestroy() {
    this.dragStartSubscription.unsubscribe();
    this.dragSubscription.unsubscribe();
    this.reorderSubscription.unsubscribe();
    this.dragEndSubscription.unsubscribe();
    this.positionSubscription.unsubscribe();
  }

  public animate(position: ElementPosition) {
    if (this.leftPx === undefined && this.topPx === undefined) {
      this.leftPx = position.left;
      this.topPx = position.top;
    } else {
      if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
      }
      let left = position.left - (this.leftPx !== undefined ? this.leftPx : 0);
      let top = position.top - (this.topPx !== undefined ? this.topPx : 0);
      this.renderer.setStyle(this.elementRef.nativeElement, 'transition', `transform ${this.layoutService.animation}ms ease-out`);
      this.renderer.setStyle(this.elementRef.nativeElement, 'transform', `translate3d(${left}px, ${top}px, 0)`);
      this.animationTimeout = setTimeout(() => {
        this.renderer.removeStyle(this.elementRef.nativeElement, 'transition');
        this.renderer.removeStyle(this.elementRef.nativeElement, 'transform');
        this.leftPx = position.left;
        this.topPx = position.top;
      }, this.layoutService.animation);
    }
  }

  private dragEvents() {
    this.dragStartSubscription = Observable.merge(
      Observable.fromEvent(this.elementRef.nativeElement, 'mousedown'),
      Observable.fromEvent(this.elementRef.nativeElement, 'touchstart'))
      .subscribe((e: MouseEvent | TouchEvent) => {
        this.startEvent = e;
        this.onDragStart(e);
      });
    const drag$: Observable<any> = Observable.merge(
      Observable.fromEvent(document, 'mousemove'),
      Observable.fromEvent(document, 'touchmove'))
      .filter(_ => this.startEvent != null);
    this.dragSubscription = drag$
      .subscribe((e: MouseEvent | TouchEvent) => {
        this.onDragging(e);
      });
    this.reorderSubscription = drag$
      .debounceTime(50)
      .subscribe((e: MouseEvent | TouchEvent) => {
        this.layoutService.repackEvent.emit(this.elementRef);
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
    const position =
      Position.calculate(e, this.startEvent, this.elementRef.nativeElement, this.layoutService.lock);
    this.renderer.setStyle(this.elementRef.nativeElement, 'transform', `translate3d(${position.left}px, ${position.top}px, 0)`);
  }

  private onDragEnd(e: MouseEvent | TouchEvent) {
    this.layoutService.repackEvent.emit();
    setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'dragging');
    }, this.layoutService.animation);
  }

  public getPosition(): ElementPosition {
    const transform = String(this.elementRef.nativeElement.style.transform);
    if (!transform) {
      return {
        left: undefined,
        top: undefined
      };
    }
    const regex = /(-*\d+)px/g;
    const matches: Array<string> = transform.match(regex);
    const x = parseInt(matches[0], 10);
    const y = parseInt(matches[1], 10);
    const z = parseInt(matches[2], 10);
    const position = {
      left: Math.max(this.leftPx + x, 0),
      top: Math.min(this.topPx + y, this.elementRef.nativeElement.parentNode.offsetWidth)
    };
    return position;
  }
}
