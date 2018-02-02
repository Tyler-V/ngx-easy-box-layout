import { Injectable, EventEmitter, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { EasyGridBoxComponent } from './easy-grid-box/easy-grid-box.component';

@Injectable()
export class EasyGridLayoutService implements OnDestroy {

  @ViewChildren('box') public components: QueryList<EasyGridBoxComponent>;

  public animation;
  public calculateLayoutEvent = new EventEmitter<void>();
  public calculateLayoutSubscription: Subscription;

  private container: ElementRef;

  constructor() {
    this.calculateLayoutSubscription = this.calculateLayoutEvent.subscribe(() => {
    });
  }

  ngOnDestroy() {
    this.calculateLayoutSubscription.unsubscribe();
  }
}
