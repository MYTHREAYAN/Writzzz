import { Sparkles, Info } from "lucide-react";

export default function HandwritingPreview({ selectedStyle, hasSamples }) {
  const isRunning = selectedStyle === "Running Letter";

  return (
    <section className="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-paper-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink-900">Handwriting Style Preview</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2.5 py-0.5 text-xs font-semibold text-terracotta-600">
              <Sparkles className="h-3 w-3" />
              {selectedStyle}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-700">
            Preview character spacing, stroke flow, and baseline characteristics.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-800">
        <Info className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
        <p className="leading-relaxed">
          <span className="font-semibold">Note:</span> Handwriting preview will use your personalized
          handwriting profile. Full AI stroke synthesis will be rendered when generating assignment pages in{" "}
          <span className="font-semibold">Module 09 (Handwriting Renderer)</span>.
        </p>
      </div>

      {/* Pangram & Character Samples */}
      <div className="space-y-4 rounded-xl border border-paper-200 bg-paper-50/50 p-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">Sample Sentence</span>
          <p
            className={`mt-2 text-xl font-medium leading-relaxed text-ink-900 ${
              isRunning ? "font-serif italic tracking-wide" : "font-sans tracking-widest"
            }`}
          >
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-paper-200/60 sm:grid-cols-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">Uppercase Set</span>
            <p
              className={`mt-1 text-sm font-medium text-ink-800 ${
                isRunning ? "font-serif italic tracking-widest" : "font-sans tracking-widest"
              }`}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">Lowercase Set</span>
            <p
              className={`mt-1 text-sm font-medium text-ink-800 ${
                isRunning ? "font-serif italic tracking-wider" : "font-sans tracking-wider"
              }`}
            >
              abcdefghijklmnopqrstuvwxyz
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">Numeric Set</span>
            <p className="mt-1 text-sm font-sans font-medium tracking-widest text-ink-800">
              0 1 2 3 4 5 6 7 8 9
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">Punctuation</span>
            <p className="mt-1 text-sm font-sans font-medium tracking-widest text-ink-800">
              . , ! ? ; : &apos; &quot; - ( ) [ ] &#123; &#125;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
