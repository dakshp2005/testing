import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Paperclip, ArrowUp, ChevronDown, Globe, ChevronRight } from "lucide-react";
import { GradientText } from "../components/ui/gradient-text";

// Example queries for the suggestion pills
const EXAMPLES = [
  "Explain quantum entanglement simply",
  "Generate a creative app name for task management",
  "Translate 'Better late than never' into Latin",
  "Write a short riddle with the answer 'time'",
];

function AILearningPage() {
  const [message, setMessage] = useState("");
  const [model] = useState("o3-mini");

  useEffect(() => {
    document.title = "AI Learning | LearnFlow";
  }, []);

  // Handle send (Enter)
  const handleSend = () => {
    if (message.trim()) {
      // Handle message submission here
      setMessage("");
    }
  };

  // Handle suggestion click
  const handleExampleClick = (example: string) => setMessage(example);

  return (
    <DashboardLayout>
      {/* Title */}
      <h1 className="mt-16 mb-8 text-[2.5rem] font-semibold text-gray-900 dark:text-gray-100 text-center w-full">
        What can I <GradientText>help you with?</GradientText>
      </h1>

      {/* Chat Input Card with Blue Glow */}
      <div className="w-full max-w-xl mx-auto mb-8 relative">
        {/* Blue glow effect behind the card */}
        <div
          className="absolute inset-0 z-0 rounded-2xl pointer-events-none"
          style={{
            filter: "blur(32px)",
            background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)", // blue to light blue
            opacity: 0.35,
          }}
        />
        <div className="relative z-10 bg-white dark:bg-[#1e293b] border border-blue-200 dark:border-blue-800 rounded-2xl shadow-md px-0 py-0 flex flex-col">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask AI anything"
            rows={1}
            className="w-full resize-none bg-transparent px-6 pt-6 pb-2 text-base font-normal text-gray-900 dark:text-blue-100 placeholder:text-blue-400 dark:placeholder:text-blue-300 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            aria-label="Chat input"
          />
          <div className="flex items-center justify-between px-4 pb-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5 text-blue-400" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800/50 transition"
                  aria-label="Select model"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {model}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition disabled:bg-blue-200 dark:disabled:bg-blue-900/30 disabled:cursor-not-allowed shadow"
              aria-label="Send"
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Example Queries as List */}
      <div className="w-full max-w-xl mx-auto">
        <div className="text-[0.95rem] font-medium text-gray-500 dark:text-gray-300 mb-3">
          Examples of queries:
        </div>
        <ul className="space-y-2">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                onClick={() => handleExampleClick(ex)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#23272e] text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition font-medium text-sm border border-gray-200 dark:border-[#374151] focus:outline-none"
                tabIndex={0}
                aria-label={ex}
              >
                <span>{ex}</span>
                <ChevronRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-500 transition" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}

export default AILearningPage;