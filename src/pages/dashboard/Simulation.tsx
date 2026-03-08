import { useState } from "react";
import {
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const AVAILABLE_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
];

export default function SimulationPage() {
  const [prompts, setPrompts] = useState([
    "What are the best AI observability tools?",
    "How do you monitor LLM applications?",
    "What tools help debug AI agents?",
  ]);
  const [newPrompt, setNewPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState(["claude-sonnet-4-6", "gpt-4o", "gemini-1.5-pro"]);
  const [isRunning, setIsRunning] = useState(false);

  function addPrompt() {
    if (newPrompt.trim() && !prompts.includes(newPrompt.trim())) {
      setPrompts([...prompts, newPrompt.trim()]);
      setNewPrompt("");
    }
  }

  function toggleModel(modelId: string) {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  }

  function handleRun() {
    setIsRunning(true);
    toast.success("Simulation started!");
    setTimeout(() => setIsRunning(false), 3000);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LLM Simulation Engine</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Test how your product appears in responses from real AI models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Test Prompts</h2>
            <div className="space-y-2 mb-3">
              {prompts.map((prompt, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">{prompt}</div>
                  <button onClick={() => setPrompts(prompts.filter((_, pi) => pi !== i))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all mt-2">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPrompt()} placeholder="Add a prompt..." className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <button onClick={addPrompt} className="rounded-lg border border-border px-3 py-2 hover:bg-accent transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-3">Target Models</h2>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((model) => {
                const selected = selectedModels.includes(model.id);
                return (
                  <button key={model.id} onClick={() => toggleModel(model.id)} className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${selected ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/30"}`}>
                    <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {selected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div>
                      <span className="font-medium">{model.name}</span>
                      <span className="text-muted-foreground ml-1.5 text-xs">{model.provider}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleRun} disabled={isRunning || prompts.length === 0 || selectedModels.length === 0} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {isRunning ? (<><Loader2 className="h-4 w-4 animate-spin" /> Running simulation...</>) : (<><Play className="h-4 w-4" /> Run Simulation ({prompts.length} prompts × {selectedModels.length} models)</>)}
          </button>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Configure your prompts and models, then run a simulation to see how AI systems respond to your brand.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
