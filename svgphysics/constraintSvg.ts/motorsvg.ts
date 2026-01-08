import { Wheel, DCMotor, MotorDrivable } from "@dimension-mismatch/2dphysics/constraints/wheel.js";
import { GROUP, LINE, RECT } from "@dimension-mismatch/svgtools";
import { ConstraintSVG, makeConstraintSVG, SVGDrawable } from "../bodyToSvg.js";
import { vec2transform } from "../calcXtransformtools.js";

export function makeWheelSVG(base: Wheel) : Wheel & SVGDrawable{
  const result = (base as Wheel & SVGDrawable);
  const rect = RECT(-base.radius, -0.5 * base.radius, 2 * base.radius, 1 * base.radius).withAttributes({"fill" : "blue"});
  const line = LINE(0,0,0,0).withAttributes({"stroke" : "magenta", "stroke-width" : 0.02});
  const force = LINE(0,0,0,0).withAttributes({"stroke" : "purple", "stroke-width" : 0.02});
  const rotateGroup =GROUP(rect, line);
  const svg = GROUP(rotateGroup,force);
  result.updateGraphics = function(){
    let translate = vec2transform.translation2(result.mountedTo.position);
    let rotate = vec2transform.rotation2(result.mountedTo.angle);
    let localtranslate = vec2transform.translation2(result.position);
    let localrotate = vec2transform.rotation2(result.angle);
    svg.withTransform(localrotate.then(localtranslate).then(rotate).then(translate));
    force.withTransform(localrotate.then(rotate).inverse());
    line.setP2(result.angularVelocity * -result.radius, 0);
    force.setP2(result.frictionForce.x, result.frictionForce.y);

  }
  result.svg = svg;
  return result;
}

export function makeMotorSVG(base: DCMotor) : DCMotor & SVGDrawable{
  const result = (base as DCMotor & SVGDrawable);
  const newOutput = makeConstraintSVG(base.output) as ConstraintSVG & MotorDrivable;
  result.output = newOutput;
  result.svg = newOutput.svg;
  result.updateGraphics = newOutput.updateGraphics;
  return result;
}