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

  @Input() spacing: number;

  @ContentChildren(EasyGridBoxComponent) boxes: QueryList<EasyGridBoxComponent>;

  private packed: number[][] = [];
  private columns = 0;

  constructor(private elementRef: ElementRef, private layoutService: EasyGridLayoutService) { }

  ngOnInit() {
    this.layoutService.animation = 500;
  }

  ngAfterContentInit() {
    this.rowPack();
  }

  private rowPack() {
    this.packed = [];
    let left = 0, row = 0, columns = 0;
    for (let i = 0; i < this.boxes.length; i++) {
      const box: EasyGridBoxComponent = this.boxes.find((item, index, array) => index === i);
      if (this.packed[row] === undefined) {
        this.packed[row] = [];
      }
      this.packed[row].push(i);
      columns++;

      const containerWidth = Math.round(this.elementRef.nativeElement.clientWidth);
      left += this.calculateLeft1(box, containerWidth);

      if (left >= containerWidth) {
        row++;
        if (columns > this.columns) {
          this.columns = columns;
        }
        columns = 0;
      }
    }
    this.sizeBoxes();
  }

  private sizeBoxes() {
    this.packed.forEach(row => {
      row.forEach(index => {
        const box = this.getBox(index);
        box.width = this.calculateWidth(box);
        box.left = this.calculateLeft(box);
      });
    });
  }

  private calculateWidth(box) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        const percent = parseInt(box.width, 10);
        return `calc(${percent}% - ${(this.spacing * this.columns - 1) / this.columns - 1}px)`;
      case Format.Pixel:
        return box.width;
    }
  }

  private calculateLeft(box) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        const percent = parseInt(box.width, 10);
        return `calc(${percent}% - ${(this.spacing * this.columns - 1) / this.columns - 1}px)`;
      case Format.Pixel:
        return box.width;
    }
  }

  private sizeBoxes1() {
    let top = 0;
    for (let i = 0; i < this.packed.length; i++) {
      let containerWidth = Math.round(this.elementRef.nativeElement.clientWidth);
      if (this.spacing) {
        containerWidth -= (this.packed[i].length - 1) * Number(this.spacing);
      }
      let left = 0;
      for (let j = 0; j < this.packed[i].length; j++) {
        const box = this.getBox(this.packed[i][j]);
        const width = this.calculateWidth1(box, containerWidth);
        box.width = `${width}px`;
        box.left = left;
        left += Number(width);
        if (this.spacing) {
          left += Number(this.spacing);
        }
        box.top = top;
      }
      top += Number(this.getBox(this.packed[i][0]).height);
    }
  }

  private calculateLeft1(box: EasyGridBoxComponent, containerWidth): number {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        return Utils.parseToDecimal(String(box.width)) * containerWidth;
      case Format.Pixel:
        return parseInt(String(box.width), 10);
    }
  }

  private calculateWidth1(box, containerWidth) {
    switch (Utils.getFormat(box.width)) {
      case Format.Percent:
        return Utils.parseToDecimal(box.width) * containerWidth;
      case Format.Pixel:
        return box.width;
    }
  }

  private getBox(index: number): EasyGridBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
