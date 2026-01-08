import { Collection, GameObject, PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "@dimension-mismatch/vec2";
import { Collision, Contact } from "./collision.js";
import { Constraint } from "./constraints/constraint.js";
import { Shape } from "./geometry.js";
import { Solver } from "./solver.js";

export class World{
    root: Collection;
    gravity: vec2 = new vec2(0, 0);
    
    solver: Solver = new Solver();
    preSolve: Function;
    constraints: Constraint[] = [];
    

    constructor(...objects: GameObject[]){
        this.root = new Collection(objects);
        this.preSolve = () => {};
    }
    addObjects(...objects: GameObject[]){
            this.root.addObjects(...objects);
    }
    addConstraints(...constraints: Constraint[]){
        this.constraints.push(...constraints);
    }
    step(dt: number, substeps: number){
        for(let i = 0; i < substeps; i++){
            this.substep(dt/substeps, i);
        }
    }
    substep(dt: number, stepCount: number){

        let objects = this.root.getAllObjects();

        //update objects positions based on velocity & acceleration
        for(let i = 0; i < objects.length; i++){
            let object = objects[i];
            
            
            // //verlet integration: p(t + 1) = 2 * p(t) - p(t - 1) + a(t) * dt^2
            // let newPosition = vec2.minus(object.position, object.lastPosition).multiplyBy(dt / object.deltaTime).add(object.position);
            // if(object.inverseMass != 0){
            //     newPosition.add(vec2.times(this.gravity, dt * dt));
            // }

            
            // let newAngle = Rotation.new(((object.angle.angle - object.lastAngle.angle) * dt / object.deltaTime) + object.angle.angle);
            if(object.inverseMass != 0){
                object.acceleration.add(vec2.times(this.gravity, dt));
            }

            object.velocity = vec2.plus(object.velocity, object.acceleration);
            object.angularVelocity = Rotation.plus(object.angularVelocity, object.angularAccerleration);

            let newPosition = vec2.plus(object.position, vec2.times(object.velocity, dt));
            let newAngle = Rotation.plus(object.angle, Rotation.times(object.angularVelocity, dt));

            object.lastPosition = object.position.copy();
            object.lastAngle = object.angle.copy();
            
            
            object.position = newPosition;
            object.angle = newAngle;
            
                

            object.acceleration = vec2.zero();
            object.angularAccerleration = Rotation.zero();

            //console.log(object.deltaTime);
            object.deltaTime = dt;
            
        }
        this.preSolve(stepCount);
        //check for collisions
        let contacts: Contact[] = [];
        for(let i = 0; i < objects.length; i++){
            let objectA = objects[i];
            for(let j = i + 1; j < objects.length; j++){
                let objectB = objects[j];
                if(objectA.inverseMass == 0 && objectB.inverseMass == 0){
                    continue;
                }
                contacts.push(...Collision(objectA, objectB))
            }
        }
        for(let i = 0; i < 3; i++){
            //Apply collision impulse forces
            this.solver.resolveVelocities(contacts);
            for(let constraint of this.constraints){
                constraint.solveVelocity(dt/3);
            }
            this.applyAccelerations(objects, dt);
        }
        //correct positions (stop colliding objects from overlapping)
        this.solver.resolvePositions(contacts);
        for(let constraint of this.constraints){
            constraint.solvePosition(dt);
        }

    }
    applyAccelerations(objects: PhysicsObject[], dt: number){
        for(let i = 0; i < objects.length; i++){
            objects[i].lastPosition.subtract(vec2.times(objects[i].acceleration, dt));
            objects[i].lastAngle.subtract(Rotation.times(objects[i].angularAccerleration, dt));

            objects[i].velocity.add(vec2.times(objects[i].acceleration, 1))
            objects[i].angularVelocity.add(Rotation.times(objects[i].angularAccerleration, 1))
            
            objects[i].acceleration = vec2.zero();
            objects[i].angularAccerleration = Rotation.zero();
        }

    }
    testHitbox(hitbox: Shape){
        let dummyObject = new PhysicsObject(vec2.zero(), hitbox, {skipCOMcalc: true});
        let contacts: Contact[] = [];
        for(let o of this.root.getAllObjects()){
            contacts.push(...Collision(o, dummyObject));
        }
        return contacts;
    }
}


