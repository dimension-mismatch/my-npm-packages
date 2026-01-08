import { ConstraintSVG, GameObjectSVG, makeConstraintSVG, makeGameObjectSVG} from "./bodyToSvg.js";
import { World } from "@dimension-mismatch/2dphysics"
import { FESVGGroup, GROUP } from "../svgtools/svgtools.js";
import { GameObject } from "@dimension-mismatch/2dphysics/body.js";
import { Constraint } from "@dimension-mismatch/2dphysics/constraints/constraint.js";

export class SVGWorld extends World{
  
  objectsSVG: FESVGGroup;
  constraintsSVG: FESVGGroup;
  svg: FESVGGroup;
  constructor(...objects: GameObject[]){
    const objs = objects.map(makeGameObjectSVG);
    super(...objs);
    this.objectsSVG = GROUP(...objs.map(o => o.svg));
    this.constraintsSVG = GROUP();
    this.svg = GROUP(this.objectsSVG, this.constraintsSVG);
  }
  addObjects(...objects: GameObject[]): void {
    const objs = objects.map(makeGameObjectSVG);
    super.addObjects(...objs);
    this.objectsSVG.addChildren(...objs.map(o => o.svg));
  }
  addConstraints(...constraints: Constraint[]): void {
    const cs = constraints.map(makeConstraintSVG);
    super.addConstraints(...cs);
    this.constraintsSVG.addChildren(...cs.map(c => c.svg));
  }
  updateGraphics(){
    for(const c of this.root.children){
      (c as GameObjectSVG).updateGraphics();
    }
    for(const c of this.constraints){
      (c as ConstraintSVG).updateGraphics();
    }
  }
}