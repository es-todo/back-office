const style: React.CSSProperties = {
  border: "2px solid",
  fontFamily: "monospace",
  textWrap: "wrap",
  whiteSpace: "pre-wrap",
  backgroundColor: "#88886030",
};

export function JSONBox({ json }: { json: any }) {
  return <div style={style}>{JSON.stringify(json, undefined, 2)}</div>;
}
