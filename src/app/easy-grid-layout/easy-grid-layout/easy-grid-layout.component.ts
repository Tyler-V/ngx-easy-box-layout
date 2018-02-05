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
      left += this.calculateWidth(box);
      if (left >= this.containerWidth) {
        left = 0;
        row++;
      }
    }
    console.log(this.packed);
    this.position();
  }

  private position() {
    this.packed.forEach(row => {
      let left = 0, top = 0;
      const columns = row.length;
      for (const i of row) {
        const box = this.boxes.find((item, index, array) => index === i);
        box._width = this.calculateWidth(box, columns);
        box._left = left;
        left += box._width + Number(this.gutter);
      }
      top += 0;
    });
  }

  private calculateWidth(box, columns?: any) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        const percent = parseInt(box.width, 10) / 100;
        let width = this.containerWidth * percent;
        if (columns) {
          width -= Number(this.gutter) * (columns - 1) / columns;
        }
        return width;
      case Format.Pixel:
        return parseInt(box.width, 10);
    }
  }

  private getBox(index: number): EasyGridBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
