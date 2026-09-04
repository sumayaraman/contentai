import type { GenerateImageInput, GeneratedImage, ImageProvider } from "../image-types";
function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char); }
export class MockImageProvider implements ImageProvider {
  readonly name = "mock";
  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const title = escapeXml(input.prompt.trim().slice(0, 70));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#f8fafc"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-opacity=".12"/></filter></defs><rect width="1024" height="1024" fill="url(#bg)"/><circle cx="780" cy="210" r="150" fill="#bfdbfe" opacity=".65"/><circle cx="190" cy="820" r="220" fill="#e0e7ff" opacity=".8"/><rect x="130" y="150" width="764" height="724" rx="44" fill="#ffffff" filter="url(#shadow)"/><rect x="190" y="220" width="644" height="360" rx="28" fill="#f1f5f9"/><circle cx="510" cy="400" r="105" fill="#cbd5e1"/><path d="M250 530l170-150 120 100 95-80 139 130v50H250z" fill="#94a3b8"/><text x="512" y="665" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#0f172a">ContentAI Demo Image</text><text x="512" y="715" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#475569">${title}</text><text x="512" y="770" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#64748b">Mock provider • demo mode</text></svg>`;
    return { url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, provider: this.name, model: "contentai-image-demo-v1" };
  }
}
