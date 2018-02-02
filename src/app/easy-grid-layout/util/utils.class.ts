export class Utils {
    public static getFormat(value: string | number): Format {
        if (String(value).includes('%')) {
            return Format.Percent;
        } else if (String(value).includes('px')) {
            return Format.Pixel;
        } else {
            return Format.Number;
        }
    }

    public static getDimension(value: string | number): string {
        switch (this.getFormat(value)) {
            case Format.Number:
                return `${value}px`;
            default:
                return String(value);
        }
    }

    public static parseToDecimal(value: string): number {
        return parseInt(value, 10) / 100;
    }
}

export enum Format {
    Pixel, Percent, Number
}
