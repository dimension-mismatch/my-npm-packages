import { Collection, GameObject, PhysicsObject } from "@dimension-mismatch/2dphysics/body.js";
import { Constraint, ConstraintType } from "@dimension-mismatch/2dphysics/constraints/constraint.js";
import { MouseConstraint, Spring } from "@dimension-mismatch/2dphysics/constraints/springs.js";
import { DCMotor, Wheel } from "@dimension-mismatch/2dphysics/constraints/wheel.js";
import { Circle, Polygon, Shape, ShapeType } from "@dimension-mismatch/2dphysics/geometry.js";
import { CIRCLE, FESVGGroup, GROUP, PATH, SVGFElement } from "@dimension-mismatch/svgtools";
import { vec2transform } from "./calcXtransformtools.js";
import { makeMotorSVG, makeWheelSVG } from "./constraintSvg.ts/motorsvg.js";
import { makeMouseConstraintSVG, makeSpringSVG } from "./constraintSvg.ts/springsvg.js";

export interface SVGDrawable{
  svg: SVGFElement;
  updateGraphics(): void;
} 

export type ConstraintSVG = Constraint & SVGDrawable;
export type GameObjectSVG = GameObject & SVGDrawable;

function makeShapeSvg(shape: Shape): FESVGGroup{
  let group: FESVGGroup;
  switch(shape.type){
    case ShapeType.CIRCLE:
      shape = shape as Circle
      group = CIRCLE(shape.COM.x, shape.COM.y, shape.radius);
      break;
    case ShapeType.POLYGON:
      shape = shape as Polygon
      let data = "M";
      for(let v of shape.vertices){
        data += v.position.x + " " + v.position.y + "L";
      }
      let v = shape.vertices[0];
      
      data += v.position.x + " " + v.position.y;
      group = PATH(data)
      break;
  }
  return group;
}


export function makeGameObjectSVG(base: GameObject): GameObjectSVG{
  const result = (base as GameObjectSVG);
  if(result.isCollection){
    const collection = (result as Collection & SVGDrawable);
    collection.children = collection.children.map(o => makeGameObjectSVG(o));
    const svg = GROUP(...collection.children.map(o => (o as GameObjectSVG).svg));
    collection.updateGraphics = function(){
      collection.children.map(c => (c as GameObjectSVG).updateGraphics());
    }
    collection.svg = svg;
    return collection;
  }

  const object = result as PhysicsObject & SVGDrawable;

  const svg = GROUP(...object.colliders.map(s => makeShapeSvg(s)));
  object.updateGraphics = function(){
    let translate = vec2transform.translation2(object.position);
    let rotate = vec2transform.rotation2(object.angle);
    svg.withTransform(rotate.then(translate));
  }
  object.svg = svg;
  return object;
}


export function makeConstraintSVG(base: Constraint): ConstraintSVG{
  switch(base.constraintType){
    case ConstraintType.Spring:
      return makeSpringSVG(base as Spring);
    case ConstraintType.Mouse:
      return makeMouseConstraintSVG(base as MouseConstraint);
    case ConstraintType.Wheel:
      return makeWheelSVG(base as Wheel);
    case ConstraintType.Motor:
      return makeMotorSVG(base as DCMotor);
  }
}

