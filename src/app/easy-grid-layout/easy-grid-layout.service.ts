import { Injectable, ElementRef, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { GridBox } from './easy-grid-box/easy-grid-box';

@Injectable()
export class EasyGridLayoutService implements OnDestroy {

  public animation;
  public boxes: Array<GridBox> = [];

  public calculateLayoutEvent = new EventEmitter<void>();
  public calculateLayoutSubscription: Subscription;

  constructor(private elementRef: ElementRef) {
    this.calculateLayoutSubscription = this.calculateLayoutEvent.subscribe(() => {
      this.calculateLayout();
    });
  }

  ngOnDestroy() {
    this.calculateLayoutSubscription.unsubscribe();
  }

  calculateLayout() {

  }

}
