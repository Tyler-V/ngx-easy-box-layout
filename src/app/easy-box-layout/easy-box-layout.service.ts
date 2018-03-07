import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class EasyBoxLayoutService {

  public animation = 350;
  public lock: boolean;
  public resizeEvent = new EventEmitter<any>();
  public repackEvent = new EventEmitter<any>();

  private resizeSubscription: Subscription;

  constructor() {
    this.resizeSubscription = Observable.fromEvent(window, 'resize')
      .subscribe(() => {
        this.resizeEvent.emit();
        this.repackEvent.emit();
      });
  }
}
