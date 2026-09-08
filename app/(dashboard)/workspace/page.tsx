import { MarketingWorkspace } from "@/components/marketing/marketing-workspace";
import { getActiveWorkspace } from "@/lib/content/workspace";

export default async function WorkspacePage() {
  try {
    const { workspace, role } = await getActiveWorkspace();
    return (
      <div className="page animate-fade-up">
        <div className="page-header">
          <div>
            <p className="ai-tag" style={{ marginBottom: 6 }}>✦ Marketing Workspace</p>
            <h1 className="page-title">Your brand → a month of content</h1>
            <p className="page-subtitle">Create a reusable brand identity, generate daily content, add your logo to every image, and send the finished batch to your calendar.</p>
          </div>
        </div>
        <MarketingWorkspace workspace={workspace} canEdit={role === "OWNER" || role === "ADMIN"} />
      </div>
    );
  } catch (e) {
    return (
      <div className="page animate-fade-up">
        <div style={{ padding: 40, color: "red", fontSize: 14, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {e instanceof Error ? e.message + "\n" + e.stack : String(e)}
        </div>
      </div>
    );
  }
}
