import { Diagram, Renderer, useDiagram } from "@penrose/bloom";

export interface DiagramComponentProps {
  diagram: () => Promise<Diagram>;
}
export const DiagramComponent = (props: DiagramComponentProps): JSX.Element => {
  const diagram = useDiagram(props.diagram);

  return (
    <div
      style={{
        width: "50em",
        height: "50em",
        border: "3px solid black",
      }}
    >
      <Renderer diagram={diagram} />
    </div>
  );
};
