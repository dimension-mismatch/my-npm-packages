
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




