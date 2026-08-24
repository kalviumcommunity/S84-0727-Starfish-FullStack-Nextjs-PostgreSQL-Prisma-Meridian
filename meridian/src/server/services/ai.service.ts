import { DeploymentCorrelation } from "./correlation.service";

interface AIInsightRequest {
  correlations: DeploymentCorrelation[];
  projectName: string;
  totalCost: number;
  costIncrease?: number;
}

interface AIInsightResponse {
  title: string;
  description: string;
  recommendations: string[];
  confidenceScore: number;
}

/**
 * Generate AI insights using Groq API (free tier)
 * Fallback to rule-based insights if API key not available
 */
export async function generateAIInsights(
  request: AIInsightRequest,
): Promise<AIInsightResponse> {
  // Require explicit opt-in before calling external AI services
  // Set environment variable ALLOW_EXTERNAL_AI=true to enable external APIs.
  // By default (or when not enabled), use rule-based insights to avoid any paid services.
  const allowExternal = process.env.ALLOW_EXTERNAL_AI === "true";
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!allowExternal) {
    return generateRuleBasedInsights(request);
  }

  // If external AI is allowed, only call providers when API keys are present.
  try {
    if (groqApiKey) {
      return await generateGroqInsights(request, groqApiKey);
    }

    if (geminiApiKey) {
      return await generateGeminiInsights(request, geminiApiKey);
    }

    // No keys available — fall back to rule-based
    return generateRuleBasedInsights(request);
  } catch (error) {
    console.error("AI insights generation failed:", error);
    return generateRuleBasedInsights(request);
  }
}

/**
 * Generate insights using Groq (Llama or Mixtral)
 */
async function generateGroqInsights(
  request: AIInsightRequest,
  apiKey: string,
): Promise<AIInsightResponse> {
  const prompt = buildPrompt(request);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "groq/compound", // Free tier model
      messages: [
        {
          role: "system",
          content: "You are a FinOps expert analyzing cloud cost changes and deployments. Provide concise, actionable insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Groq API error body:", errorBody);
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content ?? "";

  return parseAIResponse(content, request);
}

/**
 * Generate insights using Google Gemini
 */
async function generateGeminiInsights(
  request: AIInsightRequest,
  apiKey: string,
): Promise<AIInsightResponse> {
  const prompt = buildPrompt(request);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a FinOps expert analyzing cloud cost changes and deployments. Provide concise, actionable insights.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text ?? "";

  return parseAIResponse(content, request);
}

/**
 * Build prompt for AI
 */
function buildPrompt(request: AIInsightRequest): string {
  let prompt = `Analyze this cloud cost situation for project "${request.projectName}":\n\n`;
  prompt += `Total Cost: $${request.totalCost.toFixed(2)}\n`;

  if (request.costIncrease) {
    prompt += `Cost Increase: ${request.costIncrease.toFixed(1)}%\n`;
  }

  prompt += `\nCost Spikes and Deployments:\n`;
  request.correlations.slice(0, 5).forEach((corr, idx) => {
    prompt += `\n${idx + 1}. ${corr.spike.service}: Cost increased ${corr.spike.percentageIncrease.toFixed(1)}% `;
    prompt += `from $${corr.spike.previousCost.toFixed(2)} to $${corr.spike.currentCost.toFixed(2)}\n`;

    if (corr.deployment) {
      prompt += `   Deployment: "${corr.deployment.message}" by ${corr.deployment.author}\n`;
      prompt += `   Confidence: ${corr.confidenceScore}%\n`;
    } else {
      prompt += `   No recent deployments found\n`;
    }
  });

  prompt += `\nProvide:\n`;
  prompt += `1. A brief title summarizing the main issue\n`;
  prompt += `2. A 2-3 sentence description of what happened\n`;
  prompt += `3. 3-5 specific, actionable recommendations\n`;
  prompt += `\nFormat as JSON: {"title": "...", "description": "...", "recommendations": ["...", "..."]}`;

  return prompt;
}

/**
 * Parse AI response
 */
function parseAIResponse(content: string, request: AIInsightRequest): AIInsightResponse {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title ?? "Cost Analysis",
        description: parsed.description ?? content.slice(0, 300),
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        confidenceScore: calculateOverallConfidence(request.correlations),
      };
    }

    // Fallback parsing
    const lines = content.split("\n").filter((l) => l.trim());
    return {
      title: lines[0] ?? "Cost Analysis",
      description: lines.slice(1, 4).join(" "),
      recommendations: lines.slice(4).filter((l) => l.trim().length > 10),
      confidenceScore: calculateOverallConfidence(request.correlations),
    };
  } catch {
    return generateRuleBasedInsights(request);
  }
}

/**
 * Rule-based insights (fallback when no API key)
 */
function generateRuleBasedInsights(request: AIInsightRequest): AIInsightResponse {
  const highConfidenceCorrs = request.correlations.filter((c) => c.confidenceScore >= 70);
  const avgConfidence = calculateOverallConfidence(request.correlations);

  let title = "Cloud Cost Analysis";
  let description = "";
  const recommendations: string[] = [];

  if (highConfidenceCorrs.length > 0) {
    const topCorr = highConfidenceCorrs[0];
    title = `${topCorr.spike.service} Cost Spike Detected`;
    description = `The ${topCorr.spike.service} service experienced a ${topCorr.spike.percentageIncrease.toFixed(1)}% cost increase. `;

    if (topCorr.deployment) {
      description += `This correlates with a deployment: "${topCorr.deployment.message}". `;
      description += `The timing and deployment context suggest this change likely caused the cost increase.`;

      recommendations.push(
        `Review the deployment "${topCorr.deployment.message}" for resource-intensive changes`,
      );
      recommendations.push(`Check if autoscaling is properly configured for ${topCorr.spike.service}`);
      recommendations.push("Monitor resource utilization metrics for this service");
    } else {
      description += `No recent deployments were found, suggesting an external factor or usage pattern change.`;
      recommendations.push(`Investigate usage patterns for ${topCorr.spike.service}`);
      recommendations.push("Check for external API calls or batch job changes");
    }
  } else {
    title = "Cost Increase Detected";
    description = `Cloud costs have increased by ${request.costIncrease?.toFixed(1) ?? "unknown"}%. `;
    description += `${request.correlations.length} cost spikes were detected, but correlations with deployments are uncertain. `;
    description += `Further investigation is recommended to identify the root cause.`;

    recommendations.push("Review recent infrastructure changes manually");
    recommendations.push("Check for unusual traffic patterns or batch jobs");
    recommendations.push("Analyze resource utilization across all services");
  }

  recommendations.push("Consider setting up cost alerts for future anomalies");
  recommendations.push("Review and optimize resource allocation policies");

  return {
    title,
    description,
    recommendations: recommendations.slice(0, 5),
    confidenceScore: avgConfidence,
  };
}

/**
 * Calculate overall confidence from correlations
 */
function calculateOverallConfidence(correlations: DeploymentCorrelation[]): number {
  if (correlations.length === 0) return 0;

  const total = correlations.reduce((sum, c) => sum + c.confidenceScore, 0);
  return Math.round(total / correlations.length);
}
