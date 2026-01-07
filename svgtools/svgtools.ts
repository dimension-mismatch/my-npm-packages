import { FElement } from "@dimension-mismatch/htmltools"
import { Transform2d } from "./transformtools.js";

const ns =  "http://www.w3.org/2000/svg";
export class SVGFElement extends FElement{
    constructor(type: string){
        super(document.createElementNS(ns, type));
    }
    withTransform(tf: Transform2d){
        this.withAttributes({transform: tf.toSvgString()});
        return this;
    }
}
export class FESVG extends FElement{
    constructor(...children: SVGFElement[]){
        super(document.createElementNS(ns, "svg"), ...children);
    }
}
export const SVG = (...children: SVGFElement[]) => new FESVG(...children);

export class FESVGGroup extends SVGFElement{
    constructor(...children: SVGFElement[]){
        super("g");
        this.addChildren(...children);
    }
}
export const GROUP = (...children: SVGFElement[]) => new FESVGGroup(...children);

export class FESVGCircle extends SVGFElement{
    constructor(x: number, y: number, radius: number){
        super("circle");
        this.withAttributes({cx: x, cy: y, r: radius})
    }
    setPosition(x: number,y: number){
        this.withAttributes({cx: x, cy: y});
    }
}
export const CIRCLE = (x: number, y: number, radius: number) => new FESVGCircle(x,y,radius);


export class FESVGLine extends SVGFElement{
    constructor(x1: number, y1: number, x2: number, y2: number){
        super("line");
        this.withAttributes({x1: x1,y1: y1,x2: x2,y2: y2});
    }
    setP1(x: number, y: number){
        this.withAttributes({x1: x,y1: y});
    }
    setP2(x: number, y: number){
        this.withAttributes({x2: x,y2: y});
    }
}
export const LINE = (x1: number, y1: number, x2: number, y2: number) => new FESVGLine(x1,y1,x2,y2);

export class FESVGPath extends SVGFElement{
    constructor(data: string){
        super("path");
        this.withAttributes({d: data});
    }
    setData(data: string){
        this.withAttributes({d: data});
    }
}
export const PATH = (data: string) => new FESVGPath(data);

export class FESVGRect extends SVGFElement{
    constructor(x: number, y: number, width: number, height: number){
        super("rect");
        this.withAttributes({x: x,y: y,width: width,height: height});
    }

    setPosition(x: number, y: number){
        this.withAttributes({x: x,y: y});
    }
    setSize(width: number, height: number){
        this.withAttributes({width: width,height: height});
    }
    setBoundingBox(x1: number, y1: number, x2: number, y2: number){
        this.withAttributes({x: x1, y: y1, width: x2- x1, height: y2 - y1});
    }
}
export const RECT = (x: number, y: number, width: number, height: number) => new FESVGRect(x,y,width,height);


export interface GradientStop{
    color: string;
    offset: string;
}
class FESVGradientStop extends SVGFElement{
    constructor(stop: GradientStop){
        super("stop");
        this.withAttributes({style: `stop-color: ${stop.color};`, offset: stop.offset})
    }
}
export class FESVGLinearGradient extends SVGFElement{
    constructor(id: string, gradientTransform: Transform2d, ...stops: GradientStop[]){
        super("linearGradient");
        this.withAttributes({id: id, gradientTransform: gradientTransform.toSvgString()});
        this.addChildren(...stops.map((s) => new FESVGradientStop(s)));
    }
}

export class FESVGPattern extends SVGFElement{
    constructor(id: string, transform: Transform2d, ...content: SVGFElement[]){
        super("pattern");
        this.withAttributes({id: id, transform: transform.toSvgString()});
        this.addChildren(...content);
    }
}