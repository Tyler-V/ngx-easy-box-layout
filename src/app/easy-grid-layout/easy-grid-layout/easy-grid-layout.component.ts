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

  @Input() gutter: number;

  @ContentChildren(EasyGridBoxComponent) boxes: QueryList<EasyGridBoxComponent>;

  private packed: number[][] = [];
  private boxSizes: Map<string, number> = new Map<string, number>();
  private containerWidth: number;
  private containerHeight: number;

  constructor(private elementRef: ElementRef, private layoutService: EasyGridLayoutService) { }

  ngOnInit() {
    this.layoutService.animation = 500;
    this.containerWidth = Math.round(this.elementRef.nativeElement.clientWidth);
    this.containerHeight = Math.round(this.elementRef.nativeElement.clientHeight);
  }

  ngAfterContentInit() {
    this.pack();
  }

  private pack() {
    this.packed = [];
    let left = 0, row = 0;
    for (let i = 0; i < this.boxes.length; i++) {
      const box: EasyGridBoxComponent = this.boxes.find((item, index, array) => index === i);
      if (this.packed[row] === undefined) {
        this.packed[row] = [];
      }
      this.packed[row].push(i);
      box._width = this.getWidth(box);
      left += box._width;
      if (left >= this.containerWidth) {
        left = 0;
        row++;
      }
    }
    console.log(this.packed);
    this.position();
  }

  private position() {
    let top = 0;
    this.packed.forEach(row => {
      let left = 0;
      const columns = row.length;
      for (const i of row) {
        const box = this.boxes.find((item, index, array) => index === i);
        box._top = top;
        box._left = left;
        box._width = this.getGutterWidth(box, columns);
        left += box._width + Number(this.gutter);
      }
      top += 110;
    });
  }

  private getWidth(box) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        return this.containerWidth * parseInt(box.width, 10) / 100;
      case Format.Pixel:
        return parseInt(box.width, 10);
    }
  }

  private getGutterWidth(box, columns?: any): number {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        if (this.boxSizes.has(box.width)) {
          return this.boxSizes.get(box.width);
        }
        const gutterWidth = Number(this.gutter) * (columns - 1) / columns;
        box._width -= gutterWidth;
        this.boxSizes.set(box.width, box._width);
        return box._width;
      case Format.Pixel:
        return parseInt(box.width, 10);
    }
  }

  private getBox(index: number): EasyGridBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
