/**
 * https://github.com/semibran/pack
*/
export class Packer {

    public packed: Array<Rect> = [];
    private sorting: Sorting;
    private _empty = [];

    constructor(width: number, height: number, sorting?: Sorting) {
        this.sorting = sorting ? sorting : Sorting.top;
        this._empty = [{
            x: 0,
            y: 0,
            width: width,
            height: height
        }];
    }

    public pack(rects) {
        if (!(rects instanceof Array)) {
            return this._packOne(rects);
        }
        return rects.map(rect => {
            return this._packOne(rect) || rect;
        });
    }

    private _packOne(rect: Rect) {
        let pack;

        this._empty.some(fit => {
            if (this._rectFit(rect, fit)) {
                pack = fit;
                return true;
            }
            return false;
        });

        if (!pack) {
            return false;
        }

        const box: Rect = {
            x: pack.x,
            y: pack.y
        };

        box.width = rect.width;
        box.height = rect.height;
        this.packed.push(box);

        let new_empty = [];
        this._empty.forEach(fit => {
            if (!this._intersect(box, fit)) {
                return new_empty.push(fit);
            }
            new_empty = new_empty.concat(this._subtract(box, fit));
        });

        const sorted = this._sort(new_empty);

        this._empty = sorted.filter(a => {
            return sorted.every(b => {
                return a === b || !this._boxFit(a, b);
            });
        });

        this._empty = sorted.filter(a => {
            return sorted.every(b => {
                return a === b || !this._boxFit(a, b);
            });
        });

        return box;
    }

    private _sort(array: Array<any>) {
        let fn;
        switch (this.sorting) {
            case Sorting.dist:
                fn = (a, b) => {
                    return (
                        (Math.pow(a.x, 2) + Math.pow(a.y, 2)) -
                        (Math.pow(b.x, 2) + Math.pow(b.y, 2))
                    );
                };
                break;
            case Sorting.left:
                fn = this._makeAxisAlgo('x', 'y');
                break;
            case Sorting.top:
                fn = this._makeAxisAlgo('y', 'x');
                break;
        }
        return array.sort(fn);
    }

    private _makeAxisAlgo(fst, snd) {
        return (a, b) => {
            const sort = a[fst] - b[fst];
            if (sort !== 0) {
                return sort;
            }
            return a[snd] - b[snd];
        };
    }

    private _rectFit(rect: Rect, bin): boolean {
        return (
            rect.width <= bin.width &&
            rect.height <= bin.height
        );
    }

    private _boxFit(a, b) {
        return (
            a.x >= b.x && (a.x + a.width) <= (b.x + b.width) &&
            a.y >= b.y && (a.y + a.height) <= (b.y + b.height)
        );
    }

    private _intersect(a, b) {
        return (
            a.x < (b.x + b.width) && (a.x + a.width) > b.x &&
            a.y < (b.y + b.height) && (a.y + a.height) > b.y
        );
    }

    private _subtract(sub, from) {
        return [sub].concat(
            this._divideX(from, sub.x),
            this._divideX(from, sub.x + sub.width),
            this._divideY(from, sub.y),
            this._divideY(from, sub.y + sub.height)
        ).filter(box => {
            return !this._intersect(sub, box);
        });
    }

    private _divideX(box, x) {
        if (x <= box.x || x >= (box.x + box.width)) {
            return [];
        }
        return [
            { x: box.x, y: box.y, width: (x - box.x), height: box.height },
            { x: x, y: box.y, width: (box.x + box.width - x), height: box.height }
        ];
    }

    private _divideY(box, y) {
        if (y <= box.y || y >= (box.y + box.height)) {
            return [];
        }
        return [
            { x: box.x, y: box.y, width: box.width, height: (y - box.y) },
            { x: box.x, y: y, width: box.width, height: (box.y + box.height - y) }
        ];
    }
}

export interface Rect {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export enum Sorting {
    dist,
    top,
    left
}
