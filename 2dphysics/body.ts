import { Rotation, vec2 } from "@dimension-mismatch/vec2";
import { Circle, Polygon, Shape, ShapeType } from "./geometry.js";
let uniqueID: number = 0;

export class Material{
    bounciness: number; 
    friction: number;
    staticFriction: number;
    density: number;

    constructor(bounciness: number, friction: number, staticFriction: number, density: number){
        this.bounciness = bounciness;
        this.friction = friction;
        this.staticFriction = staticFriction;
        this.density = density;
    }
    static default(){
        return new Material(0.2, 0.3, 0.4, 1);
    } 
}
export interface GameObject{
    uniqueID: number;
    isCollection: boolean;
    getAllObjects(): any;
}
export class Collection implements GameObject{
    isCollection = true;
    children: GameObject[] = [];
    uniqueID: number;

    constructor(children: GameObject[]){
        this.uniqueID = uniqueID++;
        this.children = children;
    }
    static ofObjects(...objects: GameObject[]){
        return new Collection(objects)
    }
    addObjects(...objects: GameObject[]){
        this.children.push(...objects);
        return this;
    }
    getAllObjects(): PhysicsObject[]{
        let objects = [];
        for(let i = 0; i < this.children.length; i++){
            if( this.children[i].isCollection){
                objects.push(this.children[i].getAllObjects())
            }
            else{
                objects.push(this.children[i]);
            }
        }
        return objects;
    }
}
export interface PhysicsObjectOptions{
    angle?: Rotation;
    velocity?: vec2;
    angularVelocity?: Rotation;
    bounciness?: number;
    staticFriction?: number;
    friction?: number;
    density?: number; 
    mass?: number;
    material?: Material;
    static?: boolean;
    skipCOMcalc?: boolean;

}
export class PhysicsObject implements GameObject{
    getAllObjects() {
        return null;
    }
    isCollection = false;
    position: vec2;
    angle: Rotation;
    uniqueID: number;
    velocity: vec2;
    angularVelocity: Rotation;

    lastPosition: vec2;
    lastAngle: Rotation;

    deltaTime: number = 1;

    acceleration: vec2 = vec2.zero();
    angularAccerleration: Rotation = Rotation.zero();

    mass: number;
    inverseMass: number;

    inertia: number;
    inverseInertia: number;


    material: Material;

    colliders: Shape[];
    constructor(position: vec2, colliders: Shape[] | Shape, options?: PhysicsObjectOptions){
        this.uniqueID = uniqueID++;
        this.position  = position;
        if(options && options.angle){
            this.angle = options.angle;
        }
        else{
            this.angle = Rotation.zero();
        }
        

        this.lastPosition = position.copy();
        this.lastAngle = this.angle.copy();

        this.velocity = vec2.zero();
        this.angularVelocity = Rotation.zero();

        if(Array.isArray(colliders)){
            this.colliders = colliders;
        }
        else{
            this.colliders = [colliders];
        }
        
        if(options){
            if(options.velocity){
                this.lastPosition.subtract(options.velocity);
                this.velocity = options.velocity.copy();
            }
            if(options.angularVelocity){
                this.lastAngle.subtract(options.angularVelocity);
                this.angularVelocity = options.angularVelocity.copy();
            }
            if(options.material){
                this.material = options.material;
            }
            else{
                this.material = Material.default();
            }
            if(options.bounciness){
                this.material.bounciness = options.bounciness;
            }
            if(options.density){
                this.material.density = options.density;
            }
            if(options.staticFriction){
                this.material.staticFriction = options.staticFriction;
            }
            if(options.friction){
                this.material.friction = options.friction;
            }
        }
        else{
            this.material = Material.default();
        }
        this.calculateProperties(options && options.skipCOMcalc);
        if(options && options.static){
            this.inverseMass = 0;
            this.inverseInertia = 0;
        }
        if(options?.mass){
            let factor = options.mass / this.mass;
            this.mass *= factor;
            this.inertia *= factor;
            this.inverseMass /= factor;
            this.inverseInertia /= factor;
            console.log(this);
        }
    }
    private calculateProperties(skipCOM?: boolean){
        let COM = new vec2(0,0);
        let totalArea = 0;

        for(let i = 0; i < this.colliders.length; i++){
            let com = this.colliders[i].computeWeightedCOM();
            totalArea += com.area;
            COM.add(vec2.times(com.COM, com.area));
        }
        COM.divideBy(totalArea);
        this.mass = totalArea * this.material.density;
        if(skipCOM){
            COM = new vec2(0,0);
        }
        let inertia = 0;
        for(let i = 0; i < this.colliders.length; i++){
            this.colliders[i].translate(COM.inverse());
            inertia += this.colliders[i].computeInertia();
        }
        this.inertia = inertia * this.material.density;

        this.inverseMass = 1/this.mass;
        this.inverseInertia = 1/this.inertia;
    }
    worldToLocalSpace(v: vec2): vec2{
        return vec2.worldToLocalSpace(v, this.position, this.angle);
    }
    localToWorldSpace(v: vec2): vec2{
        return vec2.localToWorldSpace(v, this.position, this.angle);
    }
    localToAASpace(v: vec2): vec2{
        return vec2.localToWorldSpace(v, vec2.zero(), this.angle);
    }
    applyForce(force: vec2, location: vec2){
        this.acceleration.add(vec2.times(force, this.inverseMass));
        this.angularAccerleration.add(Rotation.new(vec2.cross(location, force) * this.inverseInertia));
    }
    translate(t: vec2, updateVelocity: boolean){
        this.position.add(t);
        if(!updateVelocity){
            this.lastPosition.add(t);
        }
    }
    setPosition(p: vec2, updateVelocity: boolean){
        if(!updateVelocity){
            this.lastPosition.add(vec2.minus(p, this.position));
            this.velocity.add(vec2.minus(p, this.position));
        }
        this.position = p;
    }
    setVelocity(v: vec2){
        this.lastPosition = vec2.minus(this.position, v);
        this.velocity = v.copy();
    }
    rotate(r: Rotation, updateVelocity: boolean){
        this.angle.add(r);
        if(!updateVelocity){
            this.lastAngle.add(r);
        }
    }
    getVelocity(): vec2{
        return this.velocity.copy();
        return vec2.minus(this.position, this.lastPosition).divideBy(this.deltaTime);
    }
    getAngularVelocity(): Rotation{
        return this.angularVelocity.copy();
        return Rotation.times(Rotation.minus(this.angle, this.lastAngle),1 / this.deltaTime);
    }

    getVelocityOfPoint(point: vec2): vec2{
        return vec2.plus(this.getVelocity(), vec2.times(vec2.rotatedBy(point, Rotation.ccw90deg()), this.getAngularVelocity().angle));
    }

    getVelocityOfLocalPoint(point: vec2): vec2{
        return vec2.plus(this.getVelocity(), vec2.times(vec2.rotatedBy(point, Rotation.plus(this.angle, Rotation.ccw90deg())), this.getAngularVelocity().angle));
    }

    //static readonly empty = new PhysicsObject(vec2.zero, Rotation.zero, [], {density: Infinity});
    static rectangle(position: vec2, width: number, height: number, options?: PhysicsObjectOptions): PhysicsObject{
        return new PhysicsObject(position, [Polygon.rectangle(vec2.zero(), width, height)], options);
    }
    static regularPolygon(position: vec2, radius: number, sides: number, options?: PhysicsObjectOptions): PhysicsObject{
        return new PhysicsObject(position, [Polygon.regularPolygon(vec2.zero(), radius, sides)], options);
    }
    static circle(position: vec2, radius: number, options?: PhysicsObjectOptions): PhysicsObject{
        return new PhysicsObject(position, [new Circle(vec2.zero(), radius)], options);
    }
}