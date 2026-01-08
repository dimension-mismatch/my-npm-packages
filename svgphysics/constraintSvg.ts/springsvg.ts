
import { vec2 } from "@dimension-mismatch/vec2";
import { CIRCLE, FESVGCircle, FESVGGroup, FESVGLine, GROUP, LINE, SVGFElement } from "@dimension-mismatch/svgtools";
import { MouseConstraint, Spring } from "@dimension-mismatch/2dphysics/constraints/springs.js"
import { SVGDrawable } from "../bodyToSvg.js";

export class SpringSVG extends FESVGGroup{
  line: FESVGLine;
  p1: FESVGCircle;
  p2: FESVGCircle;
  svg: SVGFElement;

  constructor(){
    let line = LINE(0,0,1,0).withAttributes({"stroke" : "#ff0000", "stroke-width" : 0.05});
    let p1= CIRCLE(0,0, 0.04).withAttributes({"fill": "#00ff00"});
    let p2 = CIRCLE(1,0, 0.04).withAttributes({"fill": "#00ff00"});
    super(line, p1, p2);
    this.line = line;
    this.p1 = p1;
    this.p2 = p2;
  }
  setPoints(p1: vec2, p2: vec2){
    this.line.setP1(p1.x, p1.y);
    this.line.setP2(p2.x, p2.y);
    this.p1.setPosition(p1.x, p1.y);
    this.p2.setPosition(p2.x, p2.y);
  }
}

export function makeSpringSVG(base: Spring): Spring & SVGDrawable{
  const result = (base as Spring & SVGDrawable);
  const svg = new SpringSVG();
  result.updateGraphics = function (){
    svg.setPoints(result.getPointA(), result.getPointB());
  }
  result.svg = svg;
  return result;
}

export function makeMouseConstraintSVG(base: MouseConstraint) : MouseConstraint & SVGDrawable{
  const result = (base as MouseConstraint & SVGDrawable);
  result.svg = GROUP();
  result.updateGraphics = function(){
    if(result.enabled){
      if(!(result.spring as Spring & SVGDrawable).svg){
        const newSpring = makeSpringSVG(result.spring);
        result.spring = newSpring;
        result.svg = newSpring.svg;
      }
      (result.spring as Spring & SVGDrawable).updateGraphics();
    }
  } 
  return result;
}
