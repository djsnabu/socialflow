import Anthropic from "@anthropic-ai/sdk";
import { PLATFORM_LIMITS, type Platform } from "@socialflow/shared";
import type { AIGenerateResponse, AIVariant } from "@socialflow/shared/types";

const anthropic = new Anthropic();

export class AIService {
  async generateContent(input: {
    prompt: string;
    platforms: Platform[];
    tone?: string;
    language?: string;
  }): Promise<AIGenerateResponse> {
    const platformInfo = input.platforms
      .map((p) => {
        const limits = PLATFORM_LIMITS[p];
        return `- ${p}: max ${limits.maxChars} chars, ${limits.maxHashtags} hashtags`;
      })
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Generate social media posts for the following platforms based on the given topic.

Topic/Idea: ${input.prompt}
Language: ${input.language || "fi"}
${input.tone ? `Tone: ${input.tone}` : ""}

Platform requirements:
${platformInfo}

Return a JSON object with this exact structure:
{
  "variants": [
    {
      "platform": "<platform name>",
      "content": "<post content without hashtags>",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  ],
  "engagementScore": <0-100 estimate>,
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Adapt the content style for each platform:
- X: Concise, punchy, max 2-3 hashtags
- LinkedIn: Professional, longer, storytelling, 3-5 hashtags
- Bluesky: Conversational, no hashtags needed
- Facebook: Engaging, question-based, moderate length
- Instagram: Visual description, emoji-friendly, 15-25 hashtags

Return ONLY valid JSON, no markdown or explanation.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text) as {
      variants: AIVariant[];
      engagementScore: number;
      suggestions: string[];
    };

    // Validate character counts
    parsed.variants = parsed.variants.map((v) => ({
      ...v,
      characterCount: v.content.length + v.hashtags.join(" #").length,
      withinLimit: v.content.length <= PLATFORM_LIMITS[v.platform as Platform].maxChars,
    }));

    return parsed;
  }

  async improveContent(
    content: string,
    instruction: string,
    platform?: string
  ): Promise<{ content: string; changes: string[] }> {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Improve the following social media post based on the instruction.

Original post: ${content}
${platform ? `Platform: ${platform}` : ""}
Instruction: ${instruction}

Return JSON:
{
  "content": "<improved post>",
  "changes": ["change 1", "change 2"]
}

Return ONLY valid JSON.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return JSON.parse(text);
  }

  async generateHashtags(
    content: string,
    platform: string,
    count?: number
  ): Promise<string[]> {
    const limits = PLATFORM_LIMITS[platform as Platform];
    const targetCount = count || limits?.maxHashtags || 5;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Generate ${targetCount} relevant hashtags for this social media post on ${platform}.

Post: ${content}

Return ONLY a JSON array of hashtag strings (without #): ["hashtag1", "hashtag2", ...]`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return JSON.parse(text);
  }
}
