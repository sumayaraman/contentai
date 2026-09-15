import { HelpCenter } from "@/components/help/help-center";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Help & Documentation | ContentAI",
  description: "Guides, tutorials, FAQs, and support for ContentAI.",
};

export default function HelpPage() {
  return (
    <div className="page animate-fade-up campaign-container" style={{ maxWidth: 1360, margin: "0 auto", gap: 28 }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Knowledge Base
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Help &amp; Documentation
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Master ContentAI tools, explore step-by-step feature guides, and discover quick answers to common questions.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Support &amp; Guides
        </div>
      </div>

      <HelpCenter />
    </div>
  );
}
