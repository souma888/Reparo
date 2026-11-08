import { useReducer } from "react";
import {
  analysisSchema,
  aiSchema,
  type Analysis,
  type AIAnalysis,
} from "../../shared/analysis";
type State = {
  result: Analysis | null;
  busy: boolean;
  error: string;
  draft: AIAnalysis["hypotheses"];
};
type Action =
  | { type: "result"; value: Analysis | null }
  | { type: "busy"; value: boolean }
  | { type: "error"; value: string }
  | { type: "draft"; value: AIAnalysis["hypotheses"] };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "result":
      return { ...state, result: action.value, draft: [] };
    case "busy":
      return {
        ...state,
        busy: action.value,
        ...(action.value ? { draft: [] } : {}),
      };
    case "error":
      return { ...state, error: action.value };
    case "draft":
      return { ...state, draft: action.value };
  }
}
export function useAnalysis() {
  const [state, dispatch] = useReducer(reducer, {
    result: null,
    busy: false,
    error: "",
    draft: [],
  });
  return {
    ...state,
    setResult: (value: Analysis | null) => dispatch({ type: "result", value }),
    setBusy: (value: boolean) => dispatch({ type: "busy", value }),
    setError: (value: string) => dispatch({ type: "error", value }),
    async read(response: Response): Promise<Analysis> {
      if (
        !response.headers?.get("content-type")?.includes("application/x-ndjson")
      )
        return analysisSchema.parse(await response.json());
      if (!response.body) throw new Error("Empty AI response.");
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let pending = "",
        final: Analysis | undefined;
      const process = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "result") final = analysisSchema.parse(event.result);
        if (event.type === "draft") {
          const checked = aiSchema.safeParse({
            hazardDetected: false,
            observations: [],
            hypotheses: event.hypotheses,
            questions: [],
            unknowns: [],
          });
          if (checked.success)
            dispatch({ type: "draft", value: checked.data.hypotheses });
        }
      };
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });
          if (pending.length > 100000)
            throw new Error("AI response too large.");
          const lines = pending.split("\n");
          pending = lines.pop() || "";
          for (const line of lines) process(line);
        }
        pending += decoder.decode();
        process(pending);
      } finally {
        reader.releaseLock();
      }
      if (!final) throw new Error("AI stream ended before validation.");
      return final;
    },
  };
}
