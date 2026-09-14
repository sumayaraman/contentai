import { HelpCenter } from "@/components/help/help-center";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Help & Documentation | ContentAI",
  description: "Guides, tutorials, FAQs, and support for ContentAI.",
};

export default function HelpPage() {
  return (
    <div className="page animate-fade-up">
      <HelpCenter />
    </div>
  );
}
