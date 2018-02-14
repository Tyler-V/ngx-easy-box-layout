import { Box } from './box.class';
import { Sorter, Sorting } from './sorting.class';

/**
 * https://github.com/semibran/pack
*/
export class Packer {
    public packed: Array<Box> = [];
    public empty: Array<Box> = [];
    private sorting: Sorting;

    constructor(width: number, height: number, sorting?: Sorting) {
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
                box.x = _box.x;
                box.y = _box.y;
                return true;
            }
            return false;
        });

        if (box.x === undefined || box.y === undefined) {
            return false;
        }

        this.packed.push(box);

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
