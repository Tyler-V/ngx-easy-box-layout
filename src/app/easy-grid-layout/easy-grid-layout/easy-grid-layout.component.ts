import { Component, ElementRef, Input, OnInit, AfterContentInit, QueryList, ContentChildren } from '@angular/core';
import { EasyGridLayoutService } from '../easy-grid-layout.service';
import { EasyGridBoxComponent } from '../easy-grid-box/easy-grid-box.component';
import { Utils, Format } from '../util/utils.class';


@Component({
  selector: 'ez-grid-layout',
  templateUrl: './easy-grid-layout.component.html',
  styleUrls: ['./easy-grid-layout.component.scss']
})
export class EasyGridLayoutComponent implements OnInit, AfterContentInit {

  @Input() gutter: string;

  private _gutter: number;

  @ContentChildren(EasyGridBoxComponent) boxes: QueryList<EasyGridBoxComponent>;

  private packed: number[][] = [];
  private boxWidth: Map<string, number> = new Map<string, number>();
  private containerWidth: number;
  private containerHeight: number;

  constructor(private elementRef: ElementRef, private layoutService: EasyGridLayoutService) { }

  ngOnInit() {
    this.layoutService.animation = 500;
    this.containerWidth = Math.round(this.elementRef.nativeElement.clientWidth);
    this.containerHeight = Math.round(this.elementRef.nativeElement.clientHeight);
    this._gutter = this.calcGutter(this.gutter);
  }

  ngAfterContentInit() {
    this.pack();
  }

  private pack() {
    this.packed = [];
    let left = 0, top = 0, row = 0;
    for (let i = 0; i < this.boxes.length; i++) {
      if (this.packed[row] === undefined) {
        this.packed[row] = [];
      }
      this.packed[row].push(i);

      const box: EasyGridBoxComponent = this.boxes.find((item, index, array) => index === i);

      box._left = left;
      box._top = top;
      box._height = this.calcBoxHeight(box);
      box._width = this.calcBoxWidth(box);

      left += box._width + this._gutter;
      if (left >= this.containerWidth) {
        left = 0;
        top += box._height + this._gutter;
        row++;
      }
    }
  }

  private calcBoxWidth(box) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        const percent = Utils.getNumber(box.width);
        const gutter = ((1 / percent) - 1) * this._gutter;
        const width = (this.containerWidth - gutter) * percent;
        return width;
      case Format.Pixel:
        return parseInt(box.width, 10);
    }
  }

  private calcBoxHeight(box) {
    switch (Utils.getFormat(box.height)) {
      case Format.Percent:
        return this.containerHeight * Utils.getNumber(this.gutter);
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

  private getBox(index: number): EasyGridBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
