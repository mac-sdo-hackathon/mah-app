import mermaid from "mermaid";
import React from "react";

type Props = {
  code: string;
  style?: { [key: string]: string };
};

const Mermaid: React.FC<Props> = (props) => {
  const { code, style } = props;
  const outputRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  const render = React.useCallback(async () => {
    if (outputRef.current && code) {
      try {
        // ① 一意な ID を指定する必要あり
        const { svg } = await mermaid.render(id, code);
        outputRef.current.innerHTML = svg;
      } catch (error) {
        console.error(error);
        outputRef.current.innerHTML = "Invalid syntax";
      }
    }
  }, [code]);

  React.useEffect(() => {
    render();
  }, [render]);

  return code ? (
    <>
      <div
        style={{
          ...style,
          position: "relative",
          backgroundColor: "#ffffff",
        }}
      >
        <div ref={outputRef} />
      </div>
    </>
  ) : null;
};

export default Mermaid;
