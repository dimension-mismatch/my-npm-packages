import { PhysicsObject } from "../body.js";
import { vec2 } from "@dimension-mismatch/vec2";
import { Constraint, ConstraintType } from "./constraint.js";
export interface SpringOptions{
  pointA?: vec2;
  pointB?: vec2;
  k?: number;
  damping?: number;
  length?: number;
}
export class Spring implements Constraint{
  constraintType = ConstraintType.Spring;
  objectA: PhysicsObject;
  objectB: PhysicsObject | null;
  pointA: vec2;
  pointB: vec2;
  k: number;
  damping: number;
  length: number;
  constructor(objectA: PhysicsObject, objectB: PhysicsObject | null, options?: SpringOptions){
    this.objectA = objectA;
    this.objectB = objectB;
    this.pointA = options?.pointA? options.pointA : vec2.zero();
    this.pointB = options?.pointB? options.pointB : vec2.zero();
    this.k = options?.k? options.k : 1;
    this.damping = options?.damping? options.damping: 0;
    this.length = options?.length? options.length: 0;
  }
  getPointA(){
    return this.objectA.localToWorldSpace(this.pointA);
  }
  getPointB(){
    return this.objectB? this.objectB.localToWorldSpace(this.pointB) : this.pointB;
  }
  getVelA(){
    return this.objectA.getVelocityOfLocalPoint(this.pointA);
  }
  getVelB(){
    return this.objectB? this.objectB.getVelocityOfLocalPoint(this.pointB): vec2.zero();
  }
  solveVelocity(dt: number): void {
    let displacement = vec2.minus(this.getPointB(), this.getPointA());
    let direction = displacement.normalize();


    let relativeVelocity = vec2.minus(this.getVelB(), this.getVelA());
    let normalVelocity = vec2.dot(direction, relativeVelocity);
    //F + gx' + kx. 0
    //hooke's law: F = -kx
    let force = this.k * (displacement.mag() - this.length);
    let v = vec2.plus(vec2.times(direction, force * dt), vec2.times(relativeVelocity, this.damping * dt));
    this.objectA.applyForce(v, this.objectA.localToAASpace(this.pointA));
    if(this.objectB){
      this.objectB.applyForce(vec2.times(v, -1), this.objectB.localToAASpace(this.pointB));
    }
  }
  solvePosition(): void {
      //springs only apply forces
  }
}
 
export class MouseConstraint implements Constraint{
  constraintType = ConstraintType.Mouse;
  spring: Spring;
  enabled: boolean
  constructor(){
    this.enabled = false;
  }
  solveVelocity(dt: number): void {
    if(this.enabled){
      this.spring.solveVelocity(dt);
    }
  }
  solvePosition(dt: number): void {
    if(this.enabled){
      this.spring.solvePosition();
    }
  }
  enable(object: PhysicsObject, location: vec2, mousePosition: vec2){
    this.spring = new Spring(object,null, {pointA: location, pointB: mousePosition, k: 100 * object.mass, damping: 8 * object.mass});
    this.enabled = true;
  }
  disable(){
    this.spring = null;
    this.enabled = false;
  }
  update(mousePosition: vec2){
    if(this.enabled){
      this.spring.pointB = mousePosition;
    }
    
  }
}