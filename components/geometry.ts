import {
    difference,
    intersection,
} from "polygon-clipping";
import { parseSVG } from "svg-path-parser";


/* ------------------- Types ------------------- */

export interface CanvasShape {
  key: string;
  path: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export type Ring = [number, number][];
export type Poly = Ring[];
export type MultiPoly = Poly[];

export interface IntersectionData {
  shapeA: string;
  shapeB: string;
  poly: Poly;
}

/* ---------------- SVG → Polygon ---------------- */


export function svgToPolygon(path: string, curveSteps = 20): MultiPoly {
  const commands = parseSVG(path);
  const ring: Ring = [];
  let prevX = 0, prevY = 0;

  for (const cmd of commands) {
    if (cmd.code === "M") {
      ring.push([cmd.x, cmd.y]);
      prevX = cmd.x;
      prevY = cmd.y;
    }

    else if (cmd.code === "L") {
      ring.push([cmd.x, cmd.y]);
      prevX = cmd.x;
      prevY = cmd.y;
    }

    else if (cmd.code === "Q") {
      // Quadratic: flatten into line segments
      const { x1, y1, x, y } = cmd;
      for (let t = 0; t <= 1; t += 1 / curveSteps) {
        const px =
          (1 - t) * (1 - t) * prevX +
          2 * (1 - t) * t * x1 +
          t * t * x;

        const py =
          (1 - t) * (1 - t) * prevY +
          2 * (1 - t) * t * y1 +
          t * t * y;

        ring.push([px, py]);
      }
      prevX = x;
      prevY = y;
    }

    else if (cmd.code === "C") {
      // Cubic curve flattening
      const { x1, y1, x2, y2, x, y } = cmd;
      for (let t = 0; t <= 1; t += 1 / curveSteps) {
        const px =
          prevX * (1 - t) ** 3 +
          3 * x1 * t * (1 - t) ** 2 +
          3 * x2 * t * t * (1 - t) +
          x * t ** 3;

        const py =
          prevY * (1 - t) ** 3 +
          3 * y1 * t * (1 - t) ** 2 +
          3 * y2 * t * t * (1 - t) +
          y * t ** 3;

        ring.push([px, py]);
      }
      prevX = x;
      prevY = y;
    }

    else if (cmd.code === "Z") {
      // close
    }
  }

  return [[ring]];
}

/* ------------------- Point in Ring ------------------- */

export function pointInRing(ring: Ring, x: number, y: number): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/* ------------------- Compute intersections ------------------- */

export function computeIntersections(shapes: CanvasShape[]): IntersectionData[] {
  const out: IntersectionData[] = [];

  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const A = svgToPolygon(shapes[i].path);
      const B = svgToPolygon(shapes[j].path);

      const clipped = intersection(A, B);

      if (clipped && clipped.length > 0) {
        clipped.forEach(poly => {
          out.push({ shapeA: shapes[i].key, shapeB: shapes[j].key, poly });
        });
      }
    }
  }
  return out;
}

/* ------------------- MAIN: get final region for click ------------------- */

export function getClickedRegion(
  shapes: CanvasShape[],
  intersections: IntersectionData[],
  x: number,
  y: number
): Poly | null {
  /* ---- 1. Check if the click is inside any intersection region ---- */
  for (const inter of intersections) {
    const outer = inter.poly[0];
    if (outer && pointInRing(outer, x, y)) {
      return inter.poly; // return intersection shape
    }
  }

  /* ---- 2. Else check each individual shape ---- */
  for (const shape of shapes) {
    const P = svgToPolygon(shape.path)[0]; // outer polygon
    const ring = P[0];

    if (!ring) continue;

    if (!pointInRing(ring, x, y)) continue;

    // User clicked inside this shape
    // Now subtract all intersections that involve this shape
    let remaining: MultiPoly = [[ring]];

    for (const inter of intersections) {
      if (inter.shapeA !== shape.key && inter.shapeB !== shape.key) continue;

      remaining = difference(remaining, inter.poly);
    }

    /* remaining is now a MultiPolygon containing ONLY non-overlapping parts */

    // Find which exact sub-region of remaining contains the point
    for (const poly of remaining) {
      const r = poly[0];
      if (r && pointInRing(r, x, y)) {
        return poly; // non-overlapping region of this shape
      }
    }
  }

  return null; // clicked empty space
}

export function polygonToSvg(ring: Ring): string {
  if (!ring || ring.length === 0) return "";
  let d = `M${ring[0][0]} ${ring[0][1]} `;
  for (let i = 1; i < ring.length; i++) {
    d += `L${ring[i][0]} ${ring[i][1]} `;
  }
  d += "Z";
  return d;
}
