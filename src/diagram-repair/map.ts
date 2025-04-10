import statesSvgUrl from './states.svg';
import {canvas, DiagramBuilder, objectives, Shape, Vec2} from "@penrose/bloom";

export default async function statesDiagramBuilder(): Promise<[DiagramBuilder, Shape[]]> {
  const statesSvg = await fetch(statesSvgUrl)
    .then(response => response.text())
    .then(text => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      return svgElement as unknown as SVGSVGElement;
    });

  const circlePositions = [];
  const textPositions = [];
  const textValues = [];

  const w = statesSvg.width.baseVal.value;
  const h = statesSvg.height.baseVal.value;
  const tx = x => (x - w / 2) / w * 400;
  const ty = y => -((y - h / 2) / w * 400);

  for (const elem of statesSvg.querySelectorAll("path, text") as NodeListOf<SVGPathElement | SVGTextElement>) {
    if (elem.ariaRoleDescription === "circle") {
      const matrix = elem.transform.animVal[0].matrix;
      circlePositions.push([tx(matrix.e), ty(matrix.f)]);
    }

    if (elem.tagName === "text") {
      const matrix = elem.transform.animVal[0].matrix;
      textPositions.push([tx(matrix.e), ty(matrix.f)]);
      textValues.push(elem.innerHTML);
      elem.remove();
    }
  }

  const db = new DiagramBuilder(canvas(400, 400));
  const states = db.image({
    svg: statesSvg.outerHTML,
    width: 400,
    height: 400,
    center: [0, 0],
  });

  const textElems: Shape[] = [];
  for (let i = 0; i < textPositions.length; i++) {
    const t = db.text({
      string: textValues[i],
      fontSize: "5px",
      center: [db.input({ init: textPositions[i][0] }), db.input({ init: textPositions[i][1] })],
    });
    textElems.push(t);
    db.encourage(objectives.nearVec(t.center, circlePositions[i], 5));
  }

  return [db, textElems]
}