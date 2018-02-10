import {
  Directive, OnDestroy, ElementRef, Input, Output, EventEmitter,
  HostListener, HostBinding, Renderer2, AfterViewInit
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';

@Directive({
  selector: '[ezDrag]'
})
export class DragDirective implements OnDestroy {

  @Input() movePadding = 50;
  @Input() insideParent = true;
  @Output() onDragStart = new EventEmitter();
  @Output() onDragging = new EventEmitter<Position>();
  @Output() onDragEnd = new EventEmitter();

  private dragStartSubscription: Subscription;
  private dragSubscription: Subscription;
  private dragEndSubscription: Subscription;

  private _startEvent: MouseEvent | TouchEvent;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    const dragStart$ = Observable.merge(
      Observable.fromEvent(this.elementRef.nativeElement, 'mousedown'),
      Observable.fromEvent(this.elementRef.nativeElement, 'touchstart'));
    this.dragStartSubscription = dragStart$.subscribe((e: MouseEvent | TouchEvent) => {
      this._onDragStart(e);
    });

    const dragging$ = Observable.merge(
      Observable.fromEvent(document, 'mousemove'),
      Observable.fromEvent(document, 'touchmove'));
    this.dragSubscription = dragging$
      .filter(_ => this._startEvent != null)
      .subscribe((e: MouseEvent | TouchEvent) => {
        this._onDragging(e);
      });

    const dragEnd$ = Observable.merge(
      Observable.fromEvent(document, 'mouseup'),
      Observable.fromEvent(document, 'touchend'));
    this.dragEndSubscription = dragEnd$
      .filter(_ => this._startEvent != null)
      .subscribe((e: MouseEvent | TouchEvent) => {
        this._onDragEnd(e);
      });
  }

  ngOnDestroy() {
    this.dragStartSubscription.unsubscribe();
    this.dragSubscription.unsubscribe();
    this.dragEndSubscription.unsubscribe();
  }

  private _getParent() {
    return this.elementRef.nativeElement.parentNode.parentNode;
  }

  private _onDragStart(e: MouseEvent | TouchEvent) {
    this._startEvent = e;
    this.onDragStart.emit();
  }

  private _onDragging(e: MouseEvent | TouchEvent) {
    this.onDragging.emit(this._calculatePosition(e));
  }

  private _onDragEnd(e: MouseEvent | TouchEvent) {
    this.onDragEnd.emit();
    this._startEvent = null;
  }

  private _getPosition(e: MouseEvent | TouchEvent): Position {
    if (e instanceof MouseEvent) {
      const event: MouseEvent = this._startEvent as MouseEvent;
      return {
        top: e.pageY - event.pageY,
        left: e.pageX - event.pageX
      };
    } else if (e instanceof TouchEvent) {
      const event = this._startEvent as TouchEvent;
      return {
        top: e.changedTouches[0].pageY - event.changedTouches[0].pageY,
        left: e.changedTouches[0].pageX - event.changedTouches[0].pageX,
      };
    }
  }

  private _calculatePosition(e: MouseEvent | TouchEvent): Position {
    const position: Position = this._getPosition(e);
    if (this.insideParent) {
      // top
      const elementOffsetTop = this.elementRef.nativeElement.offsetTop;
      if (position.top + elementOffsetTop < 0) {
        position.top = (elementOffsetTop * -1);
      }
      // bottom
      const elementOffsetHeight = this.elementRef.nativeElement.offsetHeight + elementOffsetTop;
      const parentOffsetHeight = this._getParent().offsetHeight;
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
      const parentOffsetWidth = this._getParent().offsetWidth;
      if (position.left + elementOffsetWidth > parentOffsetWidth) {
        position.left = parentOffsetWidth - elementOffsetWidth;
      }
    }
    return position;
  }
}

export interface Position {
  top: number;
  left: number;
}
