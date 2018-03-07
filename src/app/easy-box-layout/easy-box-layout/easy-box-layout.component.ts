import { Component, ElementRef, Input, OnInit, OnDestroy, AfterContentInit, QueryList, ContentChildren } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { EasyBoxLayoutService } from '../easy-box-layout.service';
import { EasyBoxComponent } from '../easy-box/easy-box.component';
import { Utils, Format } from '../util/utils.class';
import { Packer } from './packer/packer.class';
import { Sorting } from './packer/sorting.class';
import { Box } from './packer/box.class';

@Component({
  selector: 'ez-box-layout',
  templateUrl: './easy-box-layout.component.html',
  styleUrls: ['./easy-box-layout.component.scss']
})
export class EasyBoxLayoutComponent implements OnInit, AfterContentInit, OnDestroy {

  @Input() gutter: string;
  @Input() lock: boolean;

  @ContentChildren(EasyBoxComponent) boxes: QueryList<EasyBoxComponent>;

  private boxWidth: Map<string, number> = new Map<string, number>();
  private sorting: Sorting = Sorting.Horizontal;
  private resizeSubscription: Subscription;
  private repackSubscription: Subscription;

  constructor(private elementRef: ElementRef, private layoutService: EasyBoxLayoutService) {
    this.resizeSubscription = this.layoutService.resizeEvent.subscribe(() => {
      this.size();
    });
    this.repackSubscription = this.layoutService.repackEvent.subscribe(el => {
      const box = this.boxes.find((item, index, array) => item.elementRef === el);
      this.pack(box);
    });
  }

  ngOnInit() {
    this.layoutService.lock = String(this.lock) === 'true';
  }

  ngAfterContentInit() {
    this.size();
    this.pack();
  }

  ngOnDestroy() {
    this.repackSubscription.unsubscribe();
  }

  private size() {
    for (let i = 0; i < this.boxes.toArray().length; i++) {
      const box: EasyBoxComponent = this.boxes.find((item, index, array) => index === i);
      this.setBoxHeight(box);
      this.setBoxWidth(box);
      box.index = i;
    }
  }

  private pack(component?: EasyBoxComponent): void {
    const packer: Packer = new Packer(this.getContainerWidth(), this.getContainerHeight(), this.getGutter(this.gutter), this.sorting);
    const boxes = [];
    this.boxes.forEach(_component => {
      const _position = _component.getPosition();
      if (_position.left !== undefined) {
        let _containerWidth = this.getContainerWidth();
        if (_position.left + _component.widthPx > _containerWidth) {
          _position.left = _containerWidth - _component.widthPx;
        }
        _position.top = Math.min(Math.max(0, _position.top), this.getContainerHeight());
      }
      boxes.push({
        component: _component,
        index: _component.index,
        width: _component.widthPx,
        height: _component.heightPx,
        x: component === _component ? _position.left : undefined,
        y: component === _component ? _position.top : undefined
      });
    });
    packer.pack(boxes);
    for (let i = 0; i < packer.packed.length; i++) {
      const result = packer.packed[i];
      const _component: EasyBoxComponent = this.boxes.find((component, index, array) => component == result.component);
      _component.index = result.index;
      if (component !== _component) {
        _component.position$.next({
          left: result.x,
          top: result.y
        });
        _component.display = 'block';
      }
    }
    packer.unpacked.forEach((result: Box) => {
      const _component: EasyBoxComponent = this.boxes.find((component, index, array) => component == result.component);
      if (component !== _component) {
        _component.display = 'none';
      }
    });
  }

  private setBoxWidth(box: EasyBoxComponent): void {
    let widthPx;
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        const percent = Utils.getNumber(box.width);
        const gutter = ((1 / percent) - 1) * this.getGutter(this.gutter);
        widthPx = (this.getContainerWidth() - gutter) * percent;
        break;
      case Format.Pixel:
        widthPx = parseInt(box.width, 10);
        break;
    }
    box.widthPx = widthPx;
  }

  private setBoxHeight(box: EasyBoxComponent): void {
    let heightPx;
    switch (Utils.getFormat(box.height)) {
      case Format.Percent:
        const percent = Utils.getNumber(box.height);
        const gutter = ((1 / percent) - 1) * this.getGutter(this.gutter);
        heightPx = (this.getContainerHeight() - gutter) * percent;
        break;
      case Format.Pixel:
        heightPx = parseInt(box.height, 10) - this.getGutter(this.gutter);
        break;
    }
    box.heightPx = heightPx;
  }

  private getGutter(gutter): number {
    switch (Utils.getFormat(gutter)) {
      case Format.Percent:
        return this.getContainerWidth() * Utils.getNumber(gutter);
      case Format.Pixel:
        return Utils.getNumber(gutter);
      case Format.Number:
        return gutter ? Number(gutter) : 0;
    }
  }

  private getContainerWidth(): number {
    return Math.round(this.elementRef.nativeElement.clientWidth);
  }

  private getContainerHeight(): number {
    return Math.round(this.elementRef.nativeElement.clientHeight);
  }

  private getBox(index: number): EasyBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
