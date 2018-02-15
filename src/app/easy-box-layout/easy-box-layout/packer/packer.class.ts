import { Box } from './box.class';
import { Sorter, Sorting } from './sorting.class';

export class Packer {
    public packed: Array<Box> = [];
    public empty: Array<Box> = [];
    private sorting: Sorting;
    private gutter: number;

    constructor(width: number, height: number, gutter: number, sorting?: Sorting) {
        this.gutter = gutter ? gutter : 0;
        this.sorting = sorting ? sorting : Sorting.Horizontal;
        this.empty = [{
            x: 0,
            y: 0,
            width: width,
            height: height
        }];
    }

    public pack(boxes: Array<Box>) {
        if (!(boxes instanceof Array)) {
            return this._pack(boxes);
        }
        return boxes.map(box => {
            return this._pack(box) || box;
        });
    }

    private _pack(box: Box) {
        this.empty.some(_box => {
            if (Box.boxFit(box, _box)) {
                box.x = _box.x + (_box.x > 0 ? this.gutter : 0);
                box.y = _box.y + (_box.y > 0 ? this.gutter : 0);
                box.packed = true;
                return true;
            }
            return false;
        });

        this.packed.push(box);

        if (!box.packed) {
            return false;
        }

        let new_empty: Array<Box> = [];
        this.empty.forEach(fit => {
            if (!Box.intersect(box, fit)) {
                return new_empty.push(fit);
            }
            new_empty = new_empty.concat(Box.subtract(box, fit));
        });

        const sorted = Sorter.sort(new_empty, this.sorting);
        this.empty = sorted.filter((a: Box) => {
            return sorted.every((b: Box) => {
                return a === b || !Box.boxFit(a, b);
            });
        });

        return box;
    }
}
