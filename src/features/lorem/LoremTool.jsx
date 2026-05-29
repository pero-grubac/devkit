import { useState, useCallback } from "react";
import { T } from "../../shared/theme";
import { Row, Btn, Card, Label, CopyBtn } from "../../shared/ui";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci lobortis tempus donec vitae sapien ut libero venenatis faucibus nullam quis ante etiam sit amet orci eget eros faucibus tincidunt duis leo sed fringilla mauris sit amet nibh donec sodales sagittis magna sed consequat leo pretium nibh ipsum consequat nisl vel pretium lectus quam id leo in vitae turpis massa sed elementum tempus egestas integer eget aliquet nibh praesent tristique magna".split(" ");

function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function sentence() {
  const len   = rng(8, 18);
  const words = Array.from({ length: len }, () => WORDS[rng(0, WORDS.length - 1)]);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function paragraph(sentenceCount) {
  return Array.from({ length: sentenceCount }, sentence).join(" ");
}

function wordList(count) {
  return Array.from({ length: count }, () => WORDS[rng(0, WORDS.length - 1)]).join(" ");
}

export function LoremTool() {
  const [mode,       setMode]       = useState("paragraphs");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences,  setSentences]  = useState(5);
  const [words,      setWords]      = useState(50);
  const [startLorem, setStartLorem] = useState(true);
  const [output,     setOutput]     = useState("");

  const generate = useCallback(() => {
    let text = "";
    if (mode === "paragraphs") {
      const paras = Array.from({ length: paragraphs }, () => paragraph(sentences));
      if (startLorem) {
        paras[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + paras[0];
      }
      text = paras.join("\n\n");
    } else if (mode === "sentences") {
      const sents = Array.from({ length: sentences }, sentence);
      if (startLorem) sents[0] = "Lorem ipsum dolor sit amet.";
      text = sents.join(" ");
    } else {
      text = wordList(words);
      if (startLorem) text = "Lorem ipsum " + text;
    }
    setOutput(text);
  }, [mode, paragraphs, sentences, words, startLorem]);

  const SliderRow = ({ label, value, min, max, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: T.dim, width: 80, letterSpacing: "0.15em" }}>{label}</div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={{ flex: 1, accentColor: T.acc }} />
      <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: T.acc, width: 32, textAlign: "right" }}>{value}</div>
    </div>
  );

  const wc = output ? output.trim().split(/\s+/).filter(Boolean).length : 0;
  const cc = output.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Row>
        <Card style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["paragraphs", "sentences", "words"].map(m => (
              <Btn key={m} small variant={mode === m ? "accent" : "default"} onClick={() => setMode(m)}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Btn>
            ))}
          </div>

          {mode === "paragraphs" && <>
            <SliderRow label="PARAGRAPHS" value={paragraphs} min={1} max={20} onChange={setParagraphs} />
            <SliderRow label="SENTENCES"  value={sentences}  min={2} max={12} onChange={setSentences} />
          </>}
          {mode === "sentences" && <SliderRow label="SENTENCES" value={sentences} min={1} max={50} onChange={setSentences} />}
          {mode === "words"     && <SliderRow label="WORDS"     value={words}     min={5} max={500} onChange={setWords} />}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Btn small variant={startLorem ? "accent" : "default"} onClick={() => setStartLorem(v => !v)}>
              Start with "Lorem ipsum"
            </Btn>
          </div>

          <Btn variant="accent" onClick={generate}>GENERATE</Btn>
        </Card>

        {output && (
          <Card style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[["WORDS", wc], ["CHARS", cc]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.25em", color: T.dim, marginBottom: 4 }}>{l}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: T.acc }}>{v}</div>
              </div>
            ))}
          </Card>
        )}
      </Row>

      {output && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Label>Output</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6, padding: "14px 16px", fontFamily: "var(--sans)", fontSize: 13, color: T.mid, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 420, overflowY: "auto" }}>
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
