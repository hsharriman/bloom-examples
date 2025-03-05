import {
  Circle as BloomCircle,
  Equation as BloomEquation,
  Line as BloomLine,
  Polygon as BloomPolygon,
  Vec2,
} from "@penrose/bloom";

export interface ConstructionElementCommon {
  label?: BloomEquation;
}

export interface Point extends ConstructionElementCommon {
  tag: "Point";
  pos: Vec2;
  icon: BloomCircle;
  id: number;
}

export interface Segment extends ConstructionElementCommon {
  tag: "Segment";
  point1: Point;
  point2: Point;
  icon: BloomLine;
}

export interface Line extends ConstructionElementCommon {
  tag: "Line";
  point1: Point;
  point2: Point;
  icon: BloomLine;
}

export interface Circle extends ConstructionElementCommon {
  tag: "Circle";
  center: Point;
  circumferential: Point;
  icon: BloomCircle;
}

export interface Triangle extends ConstructionElementCommon {
  tag: "Triangle";
  p1p2: Segment;
  p2p3: Segment;
  p1p3: Segment;
  p1: Point;
  p2: Point;
  p3: Point;
  icon: BloomPolygon;
}

export type ConstructionElement = Point | Segment | Line | Circle | Triangle;

export interface MkPointProps {
  x?: number;
  y?: number;
  label?: string;
  focus?: boolean;
  draggable?: boolean; // true by default
}

export type ConstructionAction =
  | "mkPoint"
  | "mkSegment"
  | "mkLine"
  | "mkCircle"
  | "mkIntersections"
  | "mkEquilateralTriangle"
  | "mkLineExtension"
  | "mkEqualSegment"
  | "mkCopySegment"
  | "mkCutGivenLen"
  | "mkBisectAngle"
  | "mkBisectSegment";

export enum CObj {
  Point = "Point",
  Segment = "Segment",
  Line = "Line",
  Circle = "Circle",
  Triangle = "Triangle",
}
