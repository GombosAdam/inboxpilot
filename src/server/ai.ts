import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface EmailSummary {
  subject: string;
  sender: string;
  summary: string;
  priority: 'low' | 'normal' | 'high';
  label: string;
  suggestedReply?: string;
  // Enhanced promotional fields
  promotionalData?: {
    type: 'newsletter' | 'sale' | 'product-launch' | 'coupon' | 'reminder' | 'survey' | 'event';
    discount?: string; // e.g., "50% off", "$20 off", "Buy 1 Get 1"
    expiryDate?: string; // When offer expires
    keyProducts?: string[]; // Main products mentioned
    callToAction?: string; // Primary CTA text
    brandCategory?: 'retail' | 'saas' | 'media' | 'finance' | 'food' | 'travel' | 'other';
  };
}

export async function processEmails(emails: Array<{
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body?: string;
  receivedAt?: Date;
}>): Promise<EmailSummary[]> {
  if (!emails.length) return [];
  
  const prompt = `Analyze these emails and provide structured responses. Read the full content carefully:

${emails.map((e, i) => `Email ${i + 1}:
From: ${e.from}
Subject: ${e.subject}
Content: ${e.body || e.snippet}
`).join('\n\n')}

For each email, provide:
1. A concise, actionable summary (1 sentence maximum) - focus on what the sender wants/needs or key information
2. Priority level:
   - high: urgent actions needed, deadlines, important requests, security alerts
   - normal: regular business/personal communication, information sharing
   - low: newsletters, promotions, non-urgent updates
3. Category label - choose ONE of: personal, work, promotional, finance, travel, shopping, social, news, health, education, support, security, legal, entertainment, food, sports, tech, real-estate, automotive, other
   - personal: emails from friends, family, personal contacts, personal relationships
   - work: job-related emails, business communications, professional contacts, meetings, projects
   - promotional: marketing emails, newsletters, sales offers, advertisements, deals, brand communications
   - finance: bank statements, payment confirmations, financial services, investments, taxes
   - travel: booking confirmations, travel updates, transportation, hotels, flights
   - shopping: order confirmations, shipping notifications, e-commerce, receipts
   - social: social media notifications, community updates, events, invitations
   - news: news updates, media subscriptions, current events, press releases
   - health: medical appointments, health services, fitness, wellness, insurance
   - education: school communications, courses, training, learning platforms
   - support: customer service, technical support, help desk, troubleshooting
   - security: security alerts, password resets, account verification, 2FA
   - legal: legal notices, contracts, compliance, terms of service
   - entertainment: streaming services, games, movies, music, events
   - food: restaurant reservations, food delivery, recipes, dining
   - sports: sports updates, team notifications, fitness, games
   - tech: software updates, technical notifications, developer content
   - real-estate: property listings, mortgage, real estate agents, rentals
   - automotive: car services, insurance, repairs, vehicle-related
   - other: anything that doesn't clearly fit the above categories
4. Suggested reply (optional, only if email clearly needs a response, max 1-2 sentences)
5. For PROMOTIONAL emails only, also extract:
   - promotionalData.type: newsletter, sale, product-launch, coupon, reminder, survey, or event
   - promotionalData.discount: any discount mentioned (e.g., "50% off", "$20 off", "BOGO")
   - promotionalData.expiryDate: when offer expires (if mentioned)
   - promotionalData.keyProducts: main products/services featured (max 3)
   - promotionalData.callToAction: primary button/action text
   - promotionalData.brandCategory: retail, saas, media, finance, food, travel, or other

Create summaries that answer: "What does this person want from me?" or "What's the key takeaway?"
For promotional emails, focus on the value proposition: "What's the deal/offer and why should I care?"

Respond in JSON format as an array of objects with: subject, sender, summary, priority, label, suggestedReply, promotionalData (only for promotional emails)`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response type');
    }
    
    // Try to extract and clean JSON from the response
    let jsonText = content.text;
    
    // Try to find JSON array
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    // Clean up common JSON issues
    jsonText = jsonText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([}\]])\s*,\s*([}\]])/g, '$1$2'); // Remove commas between closing brackets
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Problematic JSON:', jsonText.substring(0, 1000));
      
      // Try to repair incomplete JSON
      try {
        // Find the last complete object
        let repairAttempt = jsonText;
        
        // If it ends mid-object, try to close it
        if (repairAttempt.includes('{') && !repairAttempt.endsWith(']')) {
          // Count opening and closing brackets
          const openBrackets = (repairAttempt.match(/{/g) || []).length;
          const closeBrackets = (repairAttempt.match(/}/g) || []).length;
          const openArrays = (repairAttempt.match(/\[/g) || []).length;
          const closeArrays = (repairAttempt.match(/]/g) || []).length;
          
          // Add missing closing brackets
          const missingClosing = openBrackets - closeBrackets;
          const missingArrays = openArrays - closeArrays;
          
          for (let i = 0; i < missingClosing; i++) {
            repairAttempt += '}';
          }
          for (let i = 0; i < missingArrays; i++) {
            repairAttempt += ']';
          }
          
          // Remove any trailing commas before the closing brackets
          repairAttempt = repairAttempt.replace(/,(\s*[}\]]+)$/, '$1');
          
          console.log('Attempting to repair JSON...');
          return JSON.parse(repairAttempt);
        }
      } catch (repairError) {
        console.error('JSON repair also failed:', repairError);
      }
      
      throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('AI processing error:', error);
    // Return fallback summaries
    return emails.map(email => ({
      subject: email.subject,
      sender: email.from,
      summary: email.snippet || 'No summary available',
      priority: 'normal' as const,
      label: 'other',
    }));
  }
}