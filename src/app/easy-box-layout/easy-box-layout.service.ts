import { Injectable, EventEmitter, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class EasyBoxLayoutService implements OnDestroy {

  public animation;
  public lockInsideParent: boolean;
  public containerRef: ElementRef;
  public calculateLayoutEvent = new EventEmitter<void>();
  public calculateLayoutSubscription: Subscription;

  constructor() {
    this.calculateLayoutSubscription = this.calculateLayoutEvent.subscribe(() => {
    });
  }

  ngOnDestroy() {
    this.calculateLayoutSubscription.unsubscribe();
  }
}
