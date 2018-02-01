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
    this.layoutService.container = this.elementRef;
  }

  ngAfterContentInit() {
    let left = 0, top = 0;
    this.boxes.forEach(box => {
      box.left = left;
      box.top = top;
      left += this.calculateWidth(box);
      if (left >= this.layoutService.container.nativeElement.clientWidth) {
        top += Number(box.height);
        left = 0;
      }
      if (!this.isLastInRow(box)) {
        // left += Number(this.gutter);
      }
    });
  }

  private calculateWidth(box) {
    switch (typeof box.width) {
      case 'string':
        return this.parseToDecimal(box.width) * this.layoutService.container.nativeElement.clientWidth;
      case 'number':
        return box.width;
    }
  }

  private calculateHeight(box) {
    switch (typeof box.height) {
      case 'string':
        return this.parseToDecimal(box.height) * this.layoutService.container.nativeElement.clientHeight;
      case 'number':
        return box.height;
    }
  }

  private parseToDecimal(str: string) {
    return parseInt(str, 10) / 100;
  }

  private getWidth(width: string | number) {
    switch (typeof width) {
      case 'string':
        return `${width}px`;
      case 'number':
        return width;
    }
  }

  private isLastInRow(box: EasyGridBoxComponent): boolean {
    return box.left >= this.layoutService.container.nativeElement.clientWidth;
  }
}
