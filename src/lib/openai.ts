
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - in production, use server-side
});

/**
 * Analyze team pulse data to generate insights
 */
export async function analyzePulseData(pulseData: Array<{
  rating: number;
  comment?: string;
  date: string;
  userId: string;
}>) {
  try {
    const comments = pulseData
      .filter(p => p.comment && p.comment.trim())
      .map(p => p.comment)
      .join('\n');

    const ratings = pulseData.map(p => p.rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    const prompt = `
Analyze this team's daily pulse check data:

Average Rating: ${avgRating.toFixed(1)}/5
Total Responses: ${pulseData.length}

Comments from team members:
${comments}

Provide insights in JSON format:
{
  "sentiment": "positive|neutral|negative",
  "keyThemes": ["theme1", "theme2"],
  "recommendations": ["rec1", "rec2"],
  "riskFactors": ["risk1", "risk2"],
  "summary": "Brief 2-sentence summary"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing pulse data:', error);
    return null;
  }
}

/**
 * Generate meeting schedule suggestions
 */
export async function suggestMeetingTimes(teamSchedule: any, meetingDuration: number = 60) {
  try {
    const prompt = `
Based on this team's hybrid work schedule, suggest 3 optimal meeting times for a ${meetingDuration}-minute meeting:

Team Schedule Data:
${JSON.stringify(teamSchedule, null, 2)}

Provide suggestions in JSON format:
{
  "suggestions": [
    {
      "time": "2024-01-15T10:00:00Z",
      "reason": "All team members in office",
      "attendanceRate": 100
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error suggesting meeting times:', error);
    return null;
  }
}

/**
 * Generate personalized work recommendations
 */
export async function generateWorkRecommendations(userProfile: any, teamData: any) {
  try {
    const prompt = `
Generate personalized hybrid work recommendations for this user:

User Profile:
- Role: ${userProfile.role}
- Work Style: ${userProfile.workStyle || 'Not specified'}
- Team Size: ${teamData.memberCount || 'Unknown'}

Provide 3 actionable recommendations in JSON format:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "impact": "Expected positive outcome"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 400
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return null;
  }
}
