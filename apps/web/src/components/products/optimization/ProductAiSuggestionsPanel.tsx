export interface ProductMetadataSuggestion {
  productId: string;
  current: {
    title: string | null;
    description: string | null;
  };
  suggested: {
    title: string;
    description: string;
  };
}

interface ProductAiSuggestionsPanelProps {
  suggestion: ProductMetadataSuggestion | null;
  loading: boolean;
  onGenerate: () => void;
  onApply: (values: { title?: string; description?: string }) => void;
}

export function ProductAiSuggestionsPanel({
  suggestion,
  loading,
  onGenerate,
  onApply,
}: ProductAiSuggestionsPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900">AI SEO Suggestions</h3>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <svg
            className="h-6 w-6 animate-spin text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Generating suggestions...</p>
        </div>
      )}

      {/* No suggestion state */}
      {!loading && !suggestion && (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="mb-4 text-center text-sm text-gray-500">
            Generate AI-powered SEO suggestions for this product&apos;s title and description.
          </p>
          <button
            onClick={onGenerate}
            className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Generate Suggestions
          </button>
        </div>
      )}

      {/* Suggestion display */}
      {!loading && suggestion && (
        <div className="space-y-4">
          {/* Suggested title */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-purple-700">
                Suggested Title
              </span>
              <span
                className={`text-xs ${suggestion.suggested.title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {suggestion.suggested.title.length}/60
              </span>
            </div>
            <div className="rounded border border-purple-200 bg-purple-50 px-3 py-2">
              <p className="text-sm text-gray-900">{suggestion.suggested.title}</p>
            </div>
            <button
              onClick={() => onApply({ title: suggestion.suggested.title })}
              className="mt-2 text-xs font-medium text-purple-600 hover:text-purple-800"
            >
              Apply to editor
            </button>
          </div>

          {/* Suggested description */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-purple-700">
                Suggested Description
              </span>
              <span
                className={`text-xs ${suggestion.suggested.description.length > 155 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {suggestion.suggested.description.length}/155
              </span>
            </div>
            <div className="rounded border border-purple-200 bg-purple-50 px-3 py-2">
              <p className="text-sm text-gray-900">{suggestion.suggested.description}</p>
            </div>
            <button
              onClick={() => onApply({ description: suggestion.suggested.description })}
              className="mt-2 text-xs font-medium text-purple-600 hover:text-purple-800"
            >
              Apply to editor
            </button>
          </div>

          {/* Regenerate button */}
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={onGenerate}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
