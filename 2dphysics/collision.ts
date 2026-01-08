import { PhysicsObject } from "./body.js";
import { Rotation, vec2 } from "@dimension-mismatch/vec2";
import { Circle, Polygon, Shape, ShapeType, Vertex } from "./geometry.js";

export interface Contact{
    depth: number;
    normal: vec2;
    objectA?: PhysicsObject;
    objectB?: PhysicsObject;

    contactPoints: vec2[];
}

interface SATresult{
    axis: vec2;
    depth: number;
    Aindex: number;
    Bindex: number;
}
function invert(r: Contact){
    r.normal = r.normal.inverse();

    let objectB = r.objectB;
    r.objectB = r.objectA;
    r.objectA = objectB;
}
function worldToVertexSpace(v: vec2, vert: Vertex): vec2{
    return vec2.worldToLocalSpace(v , vert.position, new Rotation(0, vert.normal.x, vert.normal.y));
}
function vertexToWorldSpace(v: vec2, vert: Vertex): vec2{
    return vec2.localToWorldSpace(v , vert.position, new Rotation(0, vert.normal.x, vert.normal.y));
}
function shapeFromObjectToWorldSpace(shape: Shape, object: PhysicsObject): Shape{
    switch(shape.type){
        case ShapeType.POLYGON:
            const polygon = shape as Polygon;
            return {vertices: polygon.vertices.map((v) => 
                {return {isInternal: v.isInternal, 
                         position: object.localToWorldSpace(v.position),
                         normal: object.localToAASpace(v.normal)
                 }}), type: ShapeType.POLYGON} as Polygon;
        case ShapeType.CIRCLE:
            const circle = shape as Circle;
            return {position: object.localToWorldSpace(circle.position),
                    radius: circle.radius,
                    type: ShapeType.CIRCLE
            } as Circle;
    }
}
function SAT(shapeA: Polygon, shapeB: Polygon): Contact | false{
    let bestResult: SATresult = {axis: new vec2(0,0), depth: Infinity, Aindex: 0, Bindex: 0}

    //find which normal of shapeB has the least overlap
    for(let axis = 0; axis < shapeB.vertices.length; axis++){
        
        let AminProjection = Infinity;
        let mindex: number;

        let normal = shapeB.vertices[axis].normal;
        let BmaxProjection = vec2.dot(shapeB.vertices[axis].position, normal);

        for(let vertex = 0; vertex < shapeA.vertices.length; vertex++){

            let proj = vec2.dot(shapeA.vertices[vertex].position, normal);
            if(proj < AminProjection){
                AminProjection = proj;
                mindex = vertex;
            }

        }
        if(AminProjection > BmaxProjection){         
            return false;
        }
        if(shapeB.vertices[axis].isInternal){
            continue;
        }
        if(BmaxProjection - AminProjection < bestResult.depth){
            bestResult.depth = BmaxProjection - AminProjection;
            bestResult.axis = normal;
            bestResult.Bindex = axis;
            bestResult.Aindex = mindex;
        }
    }
    //find which face of shapeA is intersecting shapeB
    let n1idx = bestResult.Aindex; 
    let n1 = shapeA.vertices[n1idx].normal;

    let n2idx = (n1idx + 1) % shapeA.vertices.length;
    let n0idx = (n1idx - 1) % shapeA.vertices.length;

    let b1idx = bestResult.Bindex == 0? shapeB.vertices.length - 1 :bestResult.Bindex - 1;

    
    let n2 = shapeA.vertices[n1idx].normal;

    let contactPoints: vec2[];
    if(vec2.dot(n1, bestResult.axis) < vec2.dot(n2, bestResult.axis)){
        contactPoints = [shapeA.vertices[n0idx].position, shapeA.vertices[n1idx].position];
    }
    else{
        contactPoints = [shapeA.vertices[n1idx].position, shapeA.vertices[n2idx].position];
    }
    contactPoints = contactPoints.map((v) => (worldToVertexSpace(v, shapeB.vertices[bestResult.Bindex])));
    let b2 = worldToVertexSpace(shapeB.vertices[b1idx].position, shapeB.vertices[bestResult.Bindex]);

    for(let i = contactPoints.length - 1; i >= 0; i--){
        if(contactPoints[i].x > 0){
            contactPoints.splice(i);
            continue;
        }
        else{
            contactPoints[i].x = 0;
        }
        if(contactPoints[i].y > 0){
            contactPoints[i].y = 0;
        }
        if(contactPoints[i].y < b2.y){
            contactPoints[i].y = b2.y;
        }
    }
    contactPoints = contactPoints.map((v) => (vertexToWorldSpace(v, shapeB.vertices[bestResult.Bindex])));
    return {
        normal: bestResult.axis,
        depth: bestResult.depth,
        contactPoints: contactPoints
    }
}
function PolygonCollsion(shapeA: Polygon, shapeB: Polygon): Contact | false{
    let rA = SAT(shapeA, shapeB);
    if(!rA){
        return false;
    }
    let rB = SAT(shapeB, shapeA);
    if(!rB){
        return false;
    }
    if(rB.depth < rA.depth){
        invert(rB);
        return rB;
    }
    else{
        return rA;
    }
}
function CirclePolygonCollision(shapeA: Circle, shapeB: Polygon): Contact | false{

    let bestResult: {distance: number, normal: vec2, contact: vec2};
    bestResult = {distance: Infinity, normal: vec2.zero(), contact: vec2.zero()};
    
    let lastPoint = shapeB.vertices[shapeB.vertices.length - 1].position;
    for(let i = 0; i < shapeB.vertices.length; i++){
        let vertex = shapeB.vertices[i];
        
        let relativeCenter = worldToVertexSpace(shapeA.position, vertex);
        let relativeLast = worldToVertexSpace(lastPoint, vertex);
        lastPoint = vertex.position;
        
        
        let currentResult: {distance: number, normal: vec2, contact: vec2};
       

        if(relativeCenter.y > 0){
            currentResult = {
                distance: relativeCenter.mag(),
                contact: vertex.position,
                normal: vec2.asUnitVector(vec2.minus(shapeA.position, vertex.position))}
                     
        }
        else{
            if(relativeCenter.x > shapeA.radius){
                return false;
            }
            if(relativeCenter.y < relativeLast.y || vertex.isInternal){
                continue;
            }
            currentResult = {
                distance: relativeCenter.x,
                contact: vertexToWorldSpace(new vec2(0, relativeCenter.y), vertex),
                normal: vertex.normal}
        }

        
        
        

        
        if(Math.abs(currentResult.distance) < Math.abs(bestResult.distance)){
            bestResult = currentResult;
        }
    }
    if(bestResult.distance > shapeA.radius){
        return false;
    }
    return {
        normal: bestResult.normal,
        depth: shapeA.radius - bestResult.distance,

        contactPoints: [bestResult.contact]
    }
}
function PolygonCircleCollsion(shapeA: Polygon, shapeB: Circle): Contact | false{
    let ret = CirclePolygonCollision(shapeB, shapeA);
    if(!ret){
        return false;
    }
    else{
        invert(ret);
        return ret;
    }
}

function CircleCircleCollision(shapeA: Circle, shapeB: Circle): Contact | false{
    let between = vec2.minus(shapeA.position, shapeB.position);
    let dist = between.mag();
    if(between.x == 0 && between.y == 0){
        between.y = 1;
    }
    if(dist > shapeA.radius + shapeB.radius){
        return false;
    }
    else{
        let normal = vec2.dividedBy(between, dist);
        return{
            depth: shapeA.radius + shapeB.radius - dist,
            normal: normal,

            contactPoints: [vec2.plus(shapeB.position, vec2.times(normal, shapeB.radius))]
        }
    }
}
export function ShapeCollision(shapeA: Shape, shapeB: Shape): Contact | false{
    if(shapeA.type == ShapeType.CIRCLE){
        if(shapeB.type == ShapeType.CIRCLE){
            return CircleCircleCollision(shapeA as Circle, shapeB as Circle);
        }
        else{
            return CirclePolygonCollision(shapeA as Circle, shapeB as Polygon);
        }
    }
    else{
        if(shapeB.type == ShapeType.CIRCLE){
            return PolygonCircleCollsion(shapeA as Polygon, shapeB as Circle);
        }
        else{
            return PolygonCollsion(shapeA as Polygon, shapeB as Polygon);
        }
    }
}
export function Collision(objectA: PhysicsObject, objectB: PhysicsObject): Contact[]{
    let results: Contact[] = [];
    for(let i = 0; i < objectA.colliders.length; i++){
        for(let j = 0; j < objectB.colliders.length; j++){
            let transformedA = shapeFromObjectToWorldSpace(objectA.colliders[i], objectA);
            let transformedB = shapeFromObjectToWorldSpace(objectB.colliders[j], objectB);
            let res = ShapeCollision(transformedA, transformedB);
            if(res){
                res.objectA = objectA;
                res.objectB = objectB;
                results.push(res);
            }
        }
    }
    return results;
}