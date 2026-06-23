import type { TaskAnalysis } from '../types';

interface Props {
  isOpen: boolean;
  taskTitle: string;
  analysis: TaskAnalysis | null;
  isLoading: boolean;
  error?: string;
  onClose: () => void;
  onApply: () => void;
}

export default function AnalyzeModal({
  isOpen,
  taskTitle,
  analysis,
  isLoading,
  error,
  onClose,
  onApply,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">AI Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{taskTitle}</p>

        {isLoading && (
          <div className="flex items-center gap-3 py-4">
            <svg className="animate-spin w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-sm text-gray-500">Analyzing with Claude…</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        {analysis && !isLoading && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs font-medium text-indigo-600 mb-0.5">Suggested Priority</p>
              <p className="font-semibold text-indigo-800">{analysis.suggestedPriority}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Suggested Subtasks</p>
              <ul className="space-y-1.5">
                {analysis.suggestedSubTasks.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Reasoning</p>
              <p className="text-sm text-gray-600 leading-relaxed">{analysis.reasoning}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">
            Close
          </button>
          {analysis && !isLoading && (
            <button onClick={onApply} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              Apply Suggestions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
