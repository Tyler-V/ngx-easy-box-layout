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
export class EasyBoxLayoutComponent implements AfterContentInit, OnDestroy {

  @Input() gutter: string;

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

  ngAfterContentInit() {
    this.size();
    this.pack();
  }

  ngOnDestroy() {
    this.repackSubscription.unsubscribe();
  }

  private size() {
    this.boxes.forEach(box => {
      this.setBoxHeight(box);
      this.setBoxWidth(box);
    });
  }

  private pack(box?: EasyBoxComponent): void {
    const packer: Packer = new Packer(this.getContainerWidth(), this.getContainerHeight(), this.getGutter(this.gutter), Sorting.Fit);
    let i = 0;
    const boxes = [];
    this.boxes.forEach(_box => {
      const position = _box.getPosition();
      boxes.push({
        index: i,
        width: _box.widthPx,
        height: _box.heightPx,
        x: box === _box ? position.left : undefined,
        y: box === _box ? position.top : undefined
      });
      _box.index = i;
      i++;
    });
    packer.pack(boxes);
    packer.packed.forEach((result: Box) => {
      const _box: EasyBoxComponent = this.boxes.find((item, index, array) => index === result.index);
      if (_box !== box) {
        _box.leftPx = result.x;
        _box.topPx = result.y;
        _box.display = 'block';
      }
    });
    packer.unpacked.forEach((result: Box) => {
      const _box: EasyBoxComponent = this.boxes.find((item, index, array) => index === result.index);
      if (_box !== box) {
        _box.display = 'none';
      }
    });
    // console.log(packer);
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
