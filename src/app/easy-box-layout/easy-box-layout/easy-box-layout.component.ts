import { Component, ElementRef, Input, OnInit, AfterContentInit, QueryList, ContentChildren } from '@angular/core';
import { EasyBoxLayoutService } from '../easy-box-layout.service';
import { EasyBoxComponent } from '../easy-box/easy-box.component';
import { Utils, Format } from '../util/utils.class';
import { Packer } from './packer/packer.class';

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
    // this.gutter();
  }

  private size() {
    this.boxes.forEach(box => {
      box.heightPx = this.calcBoxHeight(box);
      box.widthPx = this.calcBoxWidth(box);
    });
  }

  private pack() {
    const packer: Packer = new Packer(this.containerWidth, this.containerHeight);
    const boxes = [];
    this.boxes.forEach(box => {
      boxes.push({
        width: box.widthPx,
        height: box.heightPx
      });
    });
    packer.pack(boxes);
    for (let i = 0; i < this.boxes.length; i++) {
      const box: EasyBoxComponent = this.boxes.find((item, index, array) => index === i);
      const position = packer.packed[i];
      box.leftPx = position.x;
      box.topPx = position.y;
    }
    console.log(packer);
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
        return gutter ? Number(gutter) : 0;
    }
  }

  private getBox(index: number): EasyBoxComponent {
    return this.boxes.find((_item, _index, _array) => _index === index);
  }
}
