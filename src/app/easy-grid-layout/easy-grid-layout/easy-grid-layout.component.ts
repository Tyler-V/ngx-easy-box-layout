import { Component, ElementRef, Input, OnInit, AfterContentInit, QueryList, ContentChildren } from '@angular/core';
import { EasyGridLayoutService } from '../easy-grid-layout.service';
import { EasyGridBoxComponent } from '../easy-grid-box/easy-grid-box.component';


@Component({
  selector: 'ez-grid-layout',
  templateUrl: './easy-grid-layout.component.html',
  styleUrls: ['./easy-grid-layout.component.scss']
})
export class EasyGridLayoutComponent implements OnInit, AfterContentInit {

  @Input() gutter: number;

  @ContentChildren(EasyGridBoxComponent) boxes: QueryList<EasyGridBoxComponent>;

  constructor(private elementRef: ElementRef, private layoutService: EasyGridLayoutService) { }

  ngOnInit() {
    this.layoutService.animation = 500;
  }

  ngAfterContentInit() {
    this.rowPack();
  }

  private rowPack() {
    const packed: Number[][] = [];
    let left = 0, row = 0;
    for (let i = 0; i < this.boxes.length; i++) {
      const box: EasyGridBoxComponent = this.boxes.find((item, index, array) => index === i);
      if (packed[row] === undefined) {
        packed[row] = [];
      }
      packed[row].push(i);
      left += this.calculateLeft(box);
      if (left >= this.getContainerWidth()) {
        row++;
      }
    }
    console.log(packed);
    this.sizeBoxes(packed);
  }

  private sizeBoxes(packed) {
    let left = 0, top = 0;
    for (let i = 0; i < packed.length; i++) {
      const gutter = 10;
      const gutterWidth = (packed[i].length - 1) * gutter;
      const containerWidth = this.getContainerWidth() - gutterWidth;
      for (let j = 0; j < packed[i].length; j++) {
        const box = this.getBox(j);
        box.left = left;
        // box.width = 'calc(25% - 7.5px)';
        left += ((this.parseToDecimal(box.width) * containerWidth) + gutter);
      }
    }
  }

  private getBox(index: number): EasyGridBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }

  private calculateLeft(box) {
    switch (this.getFormat(box.width)) {
      case Format.Percent:
        return this.parseToDecimal(box.width) * this.getContainerWidth();
      case Format.Pixel:
        return box.width;
    }
  }

  private getContainerWidth() {
    return Math.round(this.elementRef.nativeElement.clientWidth);
  }

  private getFormat(value: string | number): Format {
    return value.toString().includes('%') ? Format.Percent : Format.Pixel;
  }

  private parseToDecimal(value: string | number) {
    return parseInt(String(value), 10) / 100;
  }
}

export enum Format {
  Pixel, Percent
}
