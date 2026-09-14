import type { GenerateImageInput, GeneratedImage, ImageProvider } from "../image-types";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

const COFFEE_PHOTOS = [
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1080&q=80", // 1. Latte art
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&q=80", // 2. Pour over coffee
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1080&q=80", // 3. Espresso extraction
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&q=80", // 4. Coffee beans
  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1080&q=80", // 5. Iced latte
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1080&q=80", // 6. Cozy cafe with croissant
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&q=80", // 7. Barista steaming milk
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1080&q=80", // 8. Chilled cold brew
  "https://images.unsplash.com/photo-1534778101976-62847782c213?w=1080&q=80", // 9. Flat white fern
  "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1080&q=80", // 10. Morning coffee & book
  "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?w=1080&q=80", // 11. Pour over kettle
  "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=1080&q=80", // 12. Coffee cup on table
  "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=1080&q=80", // 13. Ceramic coffee cup
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1080&q=80", // 14. Espresso with cream
  "https://images.unsplash.com/photo-1494314671902-399b18174975?w=1080&q=80", // 15. Cafe exterior & coffee
  "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=1080&q=80", // 16. Fresh roasted beans
  "https://images.unsplash.com/photo-1521302200778-33500795e128?w=1080&q=80", // 17. Specialty coffee drink
  "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=1080&q=80", // 18. Barista pouring latte art
  "https://images.unsplash.com/photo-1495774856032-8b90b3de5cae?w=1080&q=80", // 19. Coffee and notebook
  "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?w=1080&q=80", // 20. Chemex brewing
  "https://images.unsplash.com/photo-1469957767070-75f494a44b20?w=1080&q=80", // 21. Coffee beans macro
  "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1080&q=80", // 22. Glass of iced coffee
  "https://images.unsplash.com/photo-1524350876685-274059332603?w=1080&q=80", // 23. Cappuccino foam
  "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=1080&q=80", // 24. Coffee roastery
  "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=1080&q=80", // 25. Two coffees on table
  "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=1080&q=80", // 26. Cozy morning coffee
  "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1080&q=80", // 27. Pouring iced latte
  "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=1080&q=80", // 28. Cortado in glass
  "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=1080&q=80", // 29. French press
  "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1080&q=80", // 30. Takeaway coffee cup
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class MockImageProvider implements ImageProvider {
  readonly name = "mock";

  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const lower = input.prompt.toLowerCase();
    const isCoffee = /coffee|cafe|espresso|latte|roast|beans|barista|brew|cappuccino|macchiato|cozy|cup|mocha|crema/i.test(lower);

    if (isCoffee) {
      // Extract day number from prompt if present
      const dayMatch = input.prompt.match(/Day\s+(\d+)/i) || input.prompt.match(/day-(\d+)/i);
      let index: number;
      if (dayMatch && dayMatch[1]) {
        index = (parseInt(dayMatch[1], 10) - 1) % COFFEE_PHOTOS.length;
      } else {
        index = hashString(input.prompt) % COFFEE_PHOTOS.length;
      }
      return {
        url: COFFEE_PHOTOS[index],
        provider: this.name,
        model: "contentai-coffee-photo-v1",
      };
    }

    // Default SVG generation for generic concepts
    const title = escapeXml(input.prompt.trim().slice(0, 70));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-opacity=".4"/></filter></defs><rect width="1024" height="1024" fill="url(#bg)"/><circle cx="780" cy="210" r="180" fill="#6d5cff" opacity=".25"/><circle cx="190" cy="820" r="220" fill="#a855f7" opacity=".2"/><rect x="130" y="150" width="764" height="724" rx="44" fill="#181829" stroke="rgba(255,255,255,0.1)" stroke-width="2" filter="url(#shadow)"/><rect x="190" y="220" width="644" height="360" rx="28" fill="#252540"/><circle cx="510" cy="400" r="90" fill="#6d5cff" opacity=".8"/><path d="M250 530l170-150 120 100 95-80 139 130v50H250z" fill="#a855f7" opacity=".9"/><text x="512" y="665" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="800" fill="#ffffff">ContentAI Marketing Image</text><text x="512" y="720" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" fill="#a89dff">${title}</text><text x="512" y="775" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" fill="#64748b">AI Powered Studio</text></svg>`;
    return {
      url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
      provider: this.name,
      model: "contentai-image-demo-v1",
    };
  }
}
