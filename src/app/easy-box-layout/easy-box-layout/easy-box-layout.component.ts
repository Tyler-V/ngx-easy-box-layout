import { Component, ElementRef, Input, OnInit, AfterContentInit, QueryList, ContentChildren } from '@angular/core';
import { EasyBoxLayoutService } from '../easy-box-layout.service';
import { EasyBoxComponent } from '../easy-box/easy-box.component';
import { Utils, Format } from '../util/utils.class';

@Component({
  selector: 'ez-box-layout',
  templateUrl: './easy-box-layout.component.html',
  styleUrls: ['./easy-box-layout.component.scss']
})
export class EasyBoxLayoutComponent implements OnInit, AfterContentInit {

  @Input() gutter: string;

  @ContentChildren(EasyBoxComponent) boxes: QueryList<EasyBoxComponent>;

  private gutterPx: number;
  private boxWidth: Map<string, number> = new Map<string, number>();
  private containerWidth: number;
  private containerHeight: number;

  constructor(private elementRef: ElementRef, private layoutService: EasyBoxLayoutService) { }

  ngOnInit() {
    this.layoutService.animation = 500;
    this.layoutService.containerRef = this.elementRef;
    this.containerWidth = Math.round(this.elementRef.nativeElement.clientWidth);
    this.containerHeight = Math.round(this.elementRef.nativeElement.clientHeight);
    this.gutterPx = this.calcGutter(this.gutter);
  }

  ngAfterContentInit() {
    this.size();
    this.pack();
  }

  private size() {
    this.boxes.forEach(box => {
      box.heightPx = this.calcBoxHeight(box);
      box.widthPx = this.calcBoxWidth(box);
    });
  }

  private pack() {
    this.boxes.forEach(box => {
      box.heightPx = this.calcBoxHeight(box);
      box.widthPx = this.calcBoxWidth(box);
      this.position(box);
    });
  }

  private position(box: EasyBoxComponent) {
    const boxes = this.boxes.filter(_ => _ !== box && _.leftPx !== undefined && _.topPx !== undefined);
    if (boxes.length === 0) {
      box.leftPx = box.topPx = 0;
      return;
    }
    let left = 0, top = 0;
    for (let i = 0; i < boxes.length; i++) {
      const _box: EasyBoxComponent = boxes.find((item, index, array) => index === i);
      left += box.widthPx + this.gutterPx;
      // top += box.heightPx + this.gutterPx;
    }
    if (left > this.containerWidth) {
      let height = Number.MAX_VALUE;
      for (let i = 0; i < boxes.length; i++) {
        const _box: EasyBoxComponent = boxes.find((item, index, array) => index === i);
        if (_box.heightPx < height) {
          // height = _box.heightPx; ?
        }
      }
    }
    box.leftPx = left;
    box.topPx = top;
  }

  private pack2() {
    let left = 0, top = 0, row = 0;
    for (let i = 0; i < this.boxes.length; i++) {
      const box: EasyBoxComponent = this.boxes.find((item, index, array) => index === i);

      box.leftPx = left;
      box.topPx = top;
      box.heightPx = this.calcBoxHeight(box);
      box.widthPx = this.calcBoxWidth(box);

      left += box.widthPx + this.gutterPx;

      if (left >= this.containerWidth) {
        left = 0;
        top += box.heightPx + this.gutterPx;
        row++;
      }
    }
  }

  private calcBoxWidth(box) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        const percent = Utils.getNumber(box.width);
        const gutter = ((1 / percent) - 1) * this.gutterPx;
        const width = (this.containerWidth - gutter) * percent;
        return width;
      case Format.Pixel:
        return parseInt(box.width, 10);
    }
  }

  private calcBoxHeight(box) {
    switch (Utils.getFormat(box.height)) {
      case Format.Percent:
        const percent = Utils.getNumber(box.height);
        const gutter = ((1 / percent) - 1) * this.gutterPx;
        const height = (this.containerHeight - gutter) * percent;
        return height;
      case Format.Pixel:
        return parseInt(box.height, 10);
    }
  }

  private calcGutter(gutter) {
    switch (Utils.getFormat(gutter)) {
      case Format.Percent:
        return this.containerWidth * Utils.getNumber(gutter);
      case Format.Pixel:
        return Utils.getNumber(gutter);
      case Format.Number:
        return Number(gutter);
    }
  }

  private getBox(index: number): EasyBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
