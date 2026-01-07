import { PhysicsObject } from "../body.js";
import { vec2, Rotation } from "../../vec2/calc.js";
import { Constraint, ConstraintType } from "./constraint.js";
export interface MotorDrivable extends Constraint{
  applyMotorTorque(torque: number): void;
  getAngularVelocity(): number;
}
export interface WheelOptions{
  cof?: number;
  static_cof?: number;
  density?: number;
  radius?: number;
  wheelCount?: number;
  angle?: Rotation;

}
export class Wheel implements MotorDrivable{
  constraintType = ConstraintType.Wheel;
  wheelCount: number = 1;
  appliedTorque: number = 0;
  frictionForce: vec2 = new vec2(0,0);
  constructor(mountedTo: PhysicsObject, position: vec2, options?: WheelOptions){
    this.mountedTo = mountedTo;
    this.position = position.copy();
    this.cof = 1.0;
    this.static_cof = 1.2;
    this.angularVelocity = 0;
    this.radius = 1;
    this.angle = Rotation.zero();
    this.wheelCount = options?.wheelCount ? options.wheelCount : 1;
    
    let density = 100;
    if(options){
      if(options.angle){
        this.angle = options.angle.copy();
      }
      if(options.cof){
        this.cof = options.cof;
      }
      if(options.density){
        density = options.density;
      }
      if(options.radius){
        this.radius = options.radius;
      }
      if(options.static_cof){
        this.static_cof = options.static_cof;
      }
      
    }
    let area = Math.PI * this.radius * this.radius;
    this.momentOfInertia = area * this.radius * this.radius * density;
  }
  applyMotorTorque(torque: number): void {
    this.appliedTorque = torque;
  }
  getAngularVelocity(): number {
    return this.angularVelocity;
  }
  solveVelocity(dt: number): void {
    let axis = vec2.rotatedBy(this.angle.unitVector(), this.mountedTo.angle);
    this.angularVelocity += this.appliedTorque / this.momentOfInertia * dt;

    let relativeVelocity: vec2 = this.mountedTo.getVelocityOfLocalPoint(this.position);
    let surfaceVelocity: vec2 = vec2.times(axis, this.angularVelocity * this.radius);
    relativeVelocity.add(surfaceVelocity);

    let AxN = vec2.cross(this.mountedTo.localToAASpace(this.position), vec2.asUnitVector(relativeVelocity));
    let massFactor = this.mountedTo.inverseMass + this.mountedTo.inverseInertia * AxN * AxN;


    let normalForce: number = 9.8 / massFactor / this.wheelCount;
    
    let antiAlignedVelocity = vec2.cross( axis, relativeVelocity);
    
    let stoppingForce = antiAlignedVelocity / massFactor / this.wheelCount;

    let slidingForce = -Math.sign(antiAlignedVelocity) * normalForce * dt;

    let antiAlignedForce = Math.abs(stoppingForce) < normalForce * this.static_cof? stoppingForce : slidingForce;
   
    this.frictionForce = vec2.times(vec2.tangent(axis), antiAlignedForce);
    
    this.mountedTo.applyForce(this.frictionForce, this.mountedTo.localToAASpace(this.position));
    
    let alignedVelocity = vec2.dot(axis, relativeVelocity);
    //1/2 I w_0^2 = 1/2mv^2 + 1/2 Iw^2, v = rw
    //w = w_0 * sqrt(I / (I + mr^2))
    let eqVelocity = this.radius * this.angularVelocity * Math.sqrt(this.momentOfInertia / (this.momentOfInertia + this.mountedTo.mass * this.radius * this.radius));

    stoppingForce = (eqVelocity - alignedVelocity) / massFactor / this.wheelCount;
    if(Math.abs(stoppingForce) < normalForce * this.static_cof){
      let stoppingTorque = (eqVelocity - alignedVelocity) / this.radius * this.momentOfInertia / this.wheelCount;

      this.mountedTo.applyForce(vec2.times(axis, stoppingForce), this.mountedTo.localToAASpace(this.position));
      this.angularVelocity += stoppingTorque / this.momentOfInertia;
    }
    else{
      slidingForce = -Math.sign(alignedVelocity) * normalForce * dt;
      this.mountedTo.applyForce(vec2.times(axis, slidingForce), this.mountedTo.localToAASpace(this.position));
      this.angularVelocity += slidingForce / this.momentOfInertia * this.radius;
    }
    
   
  }
  solvePosition(dt: number): void {

  }
  cof: number;
  static_cof: number;

  
  angularVelocity: number;
  radius: number;

  momentOfInertia: number;


  
  mountedTo: PhysicsObject;
  position: vec2;
  angle: Rotation;
  
}

export interface DCMotorOptions{
  nominalVoltage?: number;
  stallTorque?: number;
  stallCurrent?: number;
  freeCurrent?: number;
  freeSpeed?: number;
  gearRatio?: number;
}

export class DCMotor implements Constraint{
  nominalVoltage: number;
  stallTorque: number;
  stallCurrent: number;
  freeCurrent: number;
  freeSpeed: number;
  gearRatio: number;


  internalResistance: number;
  Kt: number; // N*m/A
  Kv: number; // Rad/s/V


  output: MotorDrivable;


  inputVoltage: number = 0;
  filteredVoltage: number = 0;
  constructor(output: MotorDrivable, options?: DCMotorOptions){
    //default values from KrakenX60
    this.nominalVoltage = options?.nominalVoltage? options.nominalVoltage : 12;
    this.stallTorque = options?.stallTorque? options.stallTorque : 7.09;
    this.stallCurrent = options?.stallCurrent? options.stallCurrent : 366;
    this.freeCurrent = options?.freeCurrent? options.freeCurrent : 2;
    this.freeSpeed = options?.freeSpeed? options.freeSpeed : 6000 / 60 * 2 * Math.PI;

    this.gearRatio = options?.gearRatio? options.gearRatio : 1;
    this.output = output;

    this.stallTorque *= this.gearRatio;
    this.freeSpeed /= this.gearRatio;

    this.internalResistance = this.nominalVoltage / this.stallCurrent; //Ohm's law: R = V/I
    this.Kt = this.stallTorque / this.stallCurrent;
    this.Kv = this.freeSpeed / (this.nominalVoltage - this.internalResistance * this.freeCurrent); //Find slope of the speed-voltage line
  }
  setInputVoltage(volts: number){
    this.inputVoltage = volts;
  }
  solveVelocity(dt: number): void {
    this.filteredVoltage = this.inputVoltage;
    let angularVelocity = this.output.getAngularVelocity();
    //input voltage minus back emf voltage?
    let V = this.filteredVoltage - angularVelocity / this.Kv;
    let I = V / this.internalResistance;
    let T = I * this.Kt;

    
    this.output.applyMotorTorque(T);
    this.output.solveVelocity(dt);
  }
  solvePosition(dt: number): void {
    this.output.solvePosition(dt);
  }
  constraintType = ConstraintType.Motor;
}