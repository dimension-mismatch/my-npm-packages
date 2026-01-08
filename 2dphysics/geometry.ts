import { Rotation, vec2 } from "@dimension-mismatch/vec2";

export class Vertex{
    position: vec2;
    normal: vec2;
    isInternal: boolean;
}
export enum ShapeType{
    POLYGON,
    CIRCLE
}
export type Shape = Polygon | Circle;


export class Polygon{
    type = ShapeType.POLYGON;
    vertices: Vertex[];
    constructor(points: vec2[], internalEdges?: boolean[]){
        let lastPoint = points[points.length - 1];
        this.vertices = [];
        for(let i = 0; i < points.length; i++){
            this.vertices.push(
                {position: points[i], 
                 normal: vec2.minus(points[i], lastPoint).normalize().rotateBy(Rotation.cw90deg()), 
                 isInternal: internalEdges? internalEdges[i]: false});
            lastPoint = points[i];
        }
    }
    translate(t: vec2){
        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].position.add(t);
        }
    }
    computeWeightedCOM(): {COM: vec2, area: number}{
        let COM : vec2 = vec2.zero();
        let totalArea = 0;
        let lastPoint : vec2 = this.vertices[this.vertices.length - 1].position;
        for(let i = 0; i < this.vertices.length; i++){
            let currentPoint = this.vertices[i].position;
            let triArea = vec2.cross(lastPoint, currentPoint) / 2;
            let triCom = vec2.times(vec2.plus(lastPoint, currentPoint), triArea);
            totalArea += triArea;
            COM.add(triCom);
            lastPoint = currentPoint;
        }
        COM.divideBy(totalArea);
        return {COM: COM, area: totalArea};
    }
    computeInertia() : number{
        let inertia = 0;
        let lastPoint : vec2 = this.vertices[this.vertices.length - 1].position;
        for(let i = 0; i < this.vertices.length; i++){
            let currentPoint = this.vertices[i].position;
            let triArea = vec2.cross(lastPoint, currentPoint) / 2;

            inertia += (lastPoint.magSqr() + vec2.dot(lastPoint, currentPoint) + currentPoint.magSqr()) * triArea;
            lastPoint = currentPoint;
        }
        inertia /= 6;
        return inertia;
    }
    static rectangle(position: vec2, width: number , height: number){
        let x = position.x;
        let y = position.y;
        let hw = width / 2;
        let hh = height / 2;
        return new Polygon(
            [new vec2(x - hw, y - hh),
             new vec2(x + hw, y - hh),
             new vec2(x + hw, y + hh),
             new vec2(x - hw, y + hh)]);
    }
    static cornerRect(c1: vec2, c2: vec2){
        return Polygon.rectangle(vec2.plus(c1,c2).divideBy(2), Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y));
    }
    static regularPolygon(position: vec2, radius: number, sides: number){
        let points = [];
        let rot = Rotation.new(2 * Math.PI / sides)
        let vertex = vec2.rotatedBy(new vec2(0, -radius), Rotation.times(rot, 0.5));
        for(let i = 0; i < sides; i++){
            points.push(vec2.plus(vertex, position));
            vertex.rotateBy(rot);
        }
        return new Polygon(points);
    }
}
export class Circle{
    type = ShapeType.CIRCLE;
    position: vec2;
    radius: number;
    
    constructor(position: vec2 , radius: number){
        this.position = position;
        this.radius = radius;
    }
    translate(t: vec2){
        this.position.add(t);
    }
    computeWeightedCOM(): {COM: vec2, area: number}{
        return {COM: this.position.copy(), area: Math.PI * this.radius * this.radius};
    }
    computeInertia(): number{
        let rSquared = this.radius * this.radius;
        let area = Math.PI * rSquared;
        return area * rSquared + 0.5 * this.position.magSqr() * area;
    }
}