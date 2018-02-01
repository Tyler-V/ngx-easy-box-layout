import { Injectable, EventEmitter, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { GridBox } from './easy-grid-box/easy-grid-box';
import { EasyGridBoxComponent } from './easy-grid-box/easy-grid-box.component';

@Injectable()
export class EasyGridLayoutService implements OnDestroy {

  public animation;
  @ViewChildren('box') components: QueryList<EasyGridBoxComponent>;
  public container: ElementRef;

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
