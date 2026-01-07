import { PhysicsObject } from "../body.js";
import { Rotation, vec2 } from "../../vec2/calc.js";
export enum ConstraintType{
  Spring,
  Mouse,
  Wheel,
  Motor,
}
export interface Constraint{
  solveVelocity(dt: number): void;
  solvePosition(dt: number): void;
  constraintType: ConstraintType;
}




