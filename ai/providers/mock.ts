import type { AIProvider, AIProviderResult, GenerateContentInput, CampaignGenerationInput, AICampaignProviderResult } from "../types";
const platformLabel: Record<GenerateContentInput["platform"], string> = { INSTAGRAM: "Instagram", FACEBOOK: "Facebook", LINKEDIN: "LinkedIn", X: "X" };
const toneLabel: Record<GenerateContentInput["tone"], string> = { PROFESSIONAL: "professional", FRIENDLY: "friendly", FUNNY: "playful", INSPIRATIONAL: "inspirational", EDUCATIONAL: "educational", LUXURY: "premium", CASUAL: "casual" };
export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  async generateContent(input: GenerateContentInput): Promise<AIProviderResult> {
    const platform = platformLabel[input.platform], tone = toneLabel[input.tone];
    return { provider: this.name, model: "contentai-demo-v1", content: { hook: `${input.topic}: a fresh idea your audience will want to discover.`, caption: `Meet ${input.topic} — created with ${tone} storytelling for ${input.targetAudience}.\n\nOn ${platform}, turn this idea into a useful moment for your audience: share what makes the offer different, show the experience behind it, and give people a simple reason to take the next step.\n\nBuilt around the goal of ${input.objective.toLowerCase().replace("_", " ")}, this post is ready for your brand voice and final edits.`, cta: "Discover the collection and tell us what you think.", hashtags: ["#ContentAI", "#SocialMediaMarketing", "#ContentStrategy", "#BrandStorytelling", "#MarketingTips"], imagePrompt: `A polished ${platform} social media campaign image for ${input.topic}, aimed at ${input.targetAudience}, with a ${tone} visual direction, premium commercial photography, clean composition, natural lighting, no text, no logos.` } };
  }
  async generateCampaign(input: CampaignGenerationInput): Promise<AICampaignProviderResult> {
    const start = new Date(`${input.startDate}T12:00:00`);
    const cleanTopic = input.topic.split(".")[0]?.replace(/^[^:]+:\s*/, "") || input.topic;
    const brandMatch = input.topic.match(/^([^:]+):/);
    const brand = brandMatch ? brandMatch[1].trim() : "Our Brand";
    const isCoffee = /coffee|cafe|espresso|roast|latte|brew/i.test(input.topic);

    const coffeeAngles = [
      {
        idea: "The Story Behind the Roast",
        hook: "Ever wondered what goes into roasting the perfect cup? ☕",
        caption: `At ${brand}, coffee isn't just a morning routine — it's an artisan craft.\n\nFrom sustainably harvested beans to precise temperature curves, we roast in small batches to preserve every delicate tasting note. When you take that first sip, you're tasting weeks of care, dedication, and true passion for great coffee.\n\nHow do you take your first cup of the day? Drop your routine below!`,
        cta: "Visit us this week or order your freshly roasted bag online.",
        hashtags: ["#SpecialtyCoffee", "#CoffeeRoaster", "#SingleOrigin", "#CoffeeLovers", "#CoffeeCulture", "#FreshRoast"],
        prompt: "A close-up aesthetic shot of glossy roasted coffee beans spilling from a vintage burlap bag onto a rustic dark wood surface, warm morning sunbeam, rising steam, editorial food photography, 8k, no text, no logo",
      },
      {
        idea: "The Anatomy of Perfect Espresso Crema",
        hook: "That golden hazelnut layer isn't just pretty — here is what it tells you. ✨",
        caption: `A thick, silky crema is the signature of fresh, properly extracted espresso.\n\nIt traps the rich aromatic oils and balances the intense body with velvety sweetness. If your crema is thin or pale, the beans might be losing freshness or ground too coarse.\n\nNext time you order an espresso at ${brand}, take a second to breathe in the aroma before that first sip.`,
        cta: "Save this post for your next coffee run!",
        hashtags: ["#EspressoLovers", "#Crema", "#CoffeeNerds", "#BaristaDaily", "#CoffeeGram", "#EspressoShot"],
        prompt: "A rich single shot of espresso in a clean minimalist white ceramic cup, perfect thick hazelnut crema with tiger striping, warm ambient cafe lighting, shallow depth of field, commercial editorial photography, no text, no logo",
      },
      {
        idea: "Cold Brew vs. Iced Coffee: The Big Difference",
        hook: "Cold Brew isn't just hot coffee poured over ice. Here's why. 🧊",
        caption: `It's all in the extraction time.\n\nTraditional iced coffee is brewed hot and cooled down, retaining bright acidity. Our signature Cold Brew at ${brand} is steeped in cold, filtered water for over 18 hours.\n\nThe result? Ultra-smooth, naturally sweet, with 60% less acidity and a deep chocolatey finish that goes down like velvet.\n\nTeam Cold Brew or Team Iced Americano? Let us know in the comments!`,
        cta: "Stop by and grab your cold brew on tap today.",
        hashtags: ["#ColdBrew", "#IcedCoffee", "#SummerCoffee", "#ColdBrewCoffee", "#CafeVibes", "#CoffeeBreak"],
        prompt: "A tall clear glass tumbler filled with dark rich cold brew coffee and crystal clear ice cubes, condensation glistening on the glass, rustic oak wood table, soft natural backlighting, macro commercial beverage photography, no text, no logo",
      },
      {
        idea: "Meet the Barista: The Art of Pouring",
        hook: "Behind every cup is someone who treats coffee like an art form. 🎨",
        caption: `Meet the hands crafting your daily fuel at ${brand}.\n\nPouring latte art isn't just about making hearts and swans — it's proof of steamed milk at the ideal temperature (65°C) with microfoam so smooth you can't see a single bubble.\n\nSay hi to our baristas on your next visit — they love sharing their favorite brewing tips!`,
        cta: "What's your go-to coffee order when you visit us?",
        hashtags: ["#BaristaLife", "#LatteArt", "#BaristaArt", "#CafeCulture", "#CoffeeCommunity", "#SupportLocal"],
        prompt: "A skilled barista in a stylish dark canvas apron carefully pouring milk from a stainless pitcher creating intricate latte art in a wide ceramic mug, cozy modern coffee shop background, warm aesthetic glow, no text, no logo",
      },
      {
        idea: "Single Origin Spotlight",
        hook: "Why single origin coffee will change how you taste your morning cup. 🌍",
        caption: `Blends are great for balance, but single origin beans tell a specific story.\n\nOur featured single origin this week comes from high-elevation volcanic soil, offering vibrant notes of dark berry, citrus blossom, and honeyed cocoa.\n\nNo syrup needed — just pure, natural flavors developed by altitude, rainfall, and careful washing.\n\nReady to elevate your coffee palate?`,
        cta: "Ask your barista for a pour-over of this week's single origin.",
        hashtags: ["#SingleOriginCoffee", "#SpecialtyBeans", "#EthicalSourcing", "#CoffeeOrigins", "#PourOverCoffee", "#CoffeeTasting"],
        prompt: "A glass Chemex pour-over coffee maker dripping fresh brew through a paper filter, golden liquid glowing in sunlight, roasted beans and coffee plant leaves nearby, clean modern kitchen aesthetic, no text, no logo",
      },
      {
        idea: "The Perfect Coffee & Pastry Pairing",
        hook: "Name a better duo than fresh espresso and a warm, flaky croissant. We'll wait. 🥐",
        caption: `The buttery, crisp layers of a fresh pastry cut through the bold, roasty notes of our dark roast like nothing else.\n\nEvery morning at ${brand}, our pastry case is filled with fresh bakes made to complement your coffee experience perfectly.\n\nTreat yourself today — you've earned a slow morning moment.`,
        cta: "Tag a friend who owes you a coffee date this week!",
        hashtags: ["#CoffeeAndPastry", "#CafeMorning", "#CroissantAndCoffee", "#PastryLovers", "#CoffeeMoments", "#MorningRoutine"],
        prompt: "A freshly baked golden flaky croissant on a minimalist stoneware plate next to a cup of creamy flat white with latte art, rustic linen napkin, cozy cafe table morning light, food photography, 8k, no text, no logo",
      },
      {
        idea: "Home Brewing Tip: The Golden Ratio",
        hook: "Want your home brew to taste like a specialty cafe? Try this formula. ⚖️",
        caption: `The biggest mistake people make at home is eyeballing their coffee-to-water ratio.\n\nThe golden rule: 1:16.\nFor every 1 gram of coffee, use 16 grams of water. (Roughly 15g coffee to 240g water for a standard mug).\n\nInvest in an inexpensive digital kitchen scale and watch your morning brew transform from watery or bitter to rich and balanced.\n\nSave this formula for your weekend brew!`,
        cta: "Save this post for your Saturday morning coffee ritual.",
        hashtags: ["#CoffeeTips", "#HomeBarista", "#CoffeeBrewing", "#CoffeeRatio", "#PourOverTips", "#CoffeeHacks"],
        prompt: "A digital scale with a stylish matte black pour-over dripper, ground coffee blooming with bubbles as hot water pours from a gooseneck kettle, clean slate countertop, morning light, aesthetic coffee photography, no text, no logo",
      },
    ];

    const genericAngles = [
      {
        idea: "Brand Mission & Purpose",
        hook: `Why we built ${brand} — and what drives us every day. 🚀`,
        caption: `Every business starts with a problem worth solving. At ${brand}, our mission is simple: to deliver exceptional quality, authentic service, and moments our community loves.\n\nThank you for being part of our journey from day one. Here is to making every experience unforgettable.\n\nWhat was your first experience with ${brand}? Tell us below!`,
        cta: "Follow along and discover what's coming next.",
        hashtags: ["#BrandStory", "#SmallBusiness", "#CustomerFirst", "#QualityMatters", "#CommunityFirst"],
        prompt: `A bright, inspiring commercial lifestyle photograph representing ${cleanTopic}, premium aesthetic, natural light, clean composition, editorial photography, no text, no logo`,
      },
      {
        idea: "Behind The Scenes Look",
        hook: "Take a peek behind the curtain at what happens before opening. 👀",
        caption: `It takes attention to detail to make everything run smoothly.\n\nFrom sourcing the best ingredients to polishing every detail, our team takes pride in every step of the process. We believe craftsmanship shows in the final result.\n\nSwipe to see our team in action!`,
        cta: "Leave a comment to show some love to the team!",
        hashtags: ["#BehindTheScenes", "#TeamWork", "#Craftsmanship", "#BusinessJourney", "#DailyHustle"],
        prompt: `A candid behind-the-scenes photograph of an artisan workshop or studio relating to ${cleanTopic}, warm ambient lighting, natural tones, no text, no logo`,
      },
      {
        idea: "Customer Favorite Spotlight",
        hook: "There's a reason this is our #1 most requested item. 🌟",
        caption: `When our community speaks, we listen. This week we're spotlighting our most beloved offering.\n\nCrafted with care and loved for its consistent quality, it's the item our regulars come back for again and again.\n\nHave you tried it yet?`,
        cta: "Try it today and tell us if it lives up to the hype!",
        hashtags: ["#CustomerFavorite", "#Bestseller", "#MustTry", "#TopPick", "#QualityExperience"],
        prompt: `A premium product photography showcase for ${cleanTopic}, hero angle, soft spotlight, luxurious texture, minimalist background, no text, no logo`,
      },
      {
        idea: "Community Q&A & Advice",
        hook: "One question we get asked constantly — answered! 💡",
        caption: `Getting the most out of your experience shouldn't be complicated.\n\nHere is our expert tip for the week: always prioritize quality over quantity and take time to enjoy the details. When you choose ${brand}, you're choosing intentional quality.\n\nHave a question for us? Drop it in the comments below!`,
        cta: "Ask your questions in the comments and we'll answer them all!",
        hashtags: ["#ExpertTips", "#ProAdvice", "#FAQ", "#CustomerSupport", "#KnowledgeShare"],
        prompt: `A clean, modern flat-lay composition relating to ${cleanTopic}, organized tools and natural textures, bright soft lighting, editorial layout, no text, no logo`,
      },
    ];

    const sourceAngles = isCoffee ? coffeeAngles : genericAngles;

    const days = Array.from({ length: input.duration }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);
      const template = sourceAngles[i % sourceAngles.length];

      return {
        day: i + 1,
        contentIdea: `${brand} Day ${i + 1}: ${template.idea}`,
        hook: template.hook,
        caption: template.caption,
        cta: template.cta,
        hashtags: template.hashtags,
        imagePrompt: template.prompt,
        suggestedDate: dateString,
      };
    });

    return {
      provider: this.name,
      model: "contentai-campaign-v2",
      campaign: {
        title: `${brand} — ${input.duration}-Day Marketing Campaign`,
        days,
      },
    };
  }
  async scoreContent(input: import("../types").ScoreContentInput): Promise<import("../types").ContentScoreResult> {
    const words = input.caption.trim().split(/\s+/).filter(Boolean).length;
    const hashtags = input.hashtags.split(/[\s,]+/).filter(Boolean).length;
    const hookStrength = Math.min(98, 58 + input.hook.length * 0.25);
    const readability = Math.min(96, 72 + Math.min(24, words / 8));
    const ctaStrength = Math.min(95, input.cta.length >= 12 ? 88 : 55);
    const platformSuitability = input.platform === "X" && words > 45 ? 70 : 90;
    const audienceRelevance = Math.min(96, 65 + input.targetAudience.length * 0.25);
    const hashtagQuality = hashtags >= 5 && hashtags <= 12 ? 92 : 68;
    const score = Math.round((hookStrength + readability + ctaStrength + platformSuitability + audienceRelevance + hashtagQuality) / 6);
    return { provider: this.name, model: "contentai-score-demo-v1", score: { score, breakdown: { hookStrength, readability, ctaStrength, platformSuitability, audienceRelevance, hashtagQuality }, recommendations: [ctaStrength < 80 ? "Strengthen your CTA with a specific action that invites a response." : "Your CTA is clear; test a question-based variant to encourage more comments.", hookStrength < 80 ? "Make the hook more specific or curiosity-driven." : "Your hook has a strong opening; keep testing different angles."] } };
  }
}
