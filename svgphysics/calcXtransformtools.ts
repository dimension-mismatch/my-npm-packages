import { vec2, Rotation } from "@dimension-mismatch/vec2"
import { Transform2d } from "../svgtools/transformtools";

export class vec2transform{
  static translation2(translation: vec2){
    return new Transform2d(1,0,0,1, translation.x, translation.y);
  }
  static rotation2(rotation: Rotation){
    return new Transform2d(rotation.cos, rotation.sin, -rotation.sin, rotation.cos, 0, 0);
  }
}
