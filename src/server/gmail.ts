import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { decrypt } from './crypto';

export async function getGmailClient(refreshToken: string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
  
  const decryptedToken = decrypt(refreshToken);
  oauth2Client.setCredentials({ refresh_token: decryptedToken });
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  return gmail;
}

export async function getUnreadEmails(refreshToken: string, maxResults = 500) {
  const gmail = await getGmailClient(refreshToken);
  
  // Enhanced query: UNREAD emails from INBOX in last 3 days, excluding spam/trash
  const query = 'in:inbox is:unread newer_than:3d -in:spam -in:trash';
  console.log(`🔍 Gmail Query: "${query}" (max ${maxResults} results)`);
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });
  
  if (!response.data.messages) {
    console.log('📭 No unread emails found in the last 3 days');
    return [];
  }
  
  console.log(`📬 Found ${response.data.messages.length} unread emails from last 3 days, fetching details...`);
  
  const emails = await Promise.all(
    response.data.messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });
      
      const headers = msg.data.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const dateHeader = headers.find(h => h.name === 'Date')?.value || '';
      const snippet = msg.data.snippet || '';
      
      // Parse the email date or use the message internal date as fallback
      let receivedAt = new Date();
      if (dateHeader) {
        try {
          receivedAt = new Date(dateHeader);
        } catch {
          // Fallback to Gmail's internal date
          receivedAt = new Date(parseInt(msg.data.internalDate || '0'));
        }
      } else if (msg.data.internalDate) {
        receivedAt = new Date(parseInt(msg.data.internalDate));
      }
      
      // Extract full email body content
      let body = '';
      const extractBody = (part: any): string => {
        if (part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
        
        if (part.parts) {
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/plain') {
              return extractBody(subPart);
            }
          }
          // Fallback to HTML if no plain text found
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/html') {
              const htmlContent = extractBody(subPart);
              // Basic HTML to text conversion (remove tags)
              return htmlContent.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
            }
          }
        }
        
        return '';
      };
      
      if (msg.data.payload) {
        body = extractBody(msg.data.payload);
      }
      
      // Use body if available, otherwise fallback to snippet
      const content = body.trim() || snippet;
      
      return {
        id: message.id!,
        from,
        subject,
        snippet,
        body: content.substring(0, 4000), // Limit to 4000 chars for AI processing
        receivedAt,
      };
    })
  );
  
  // Sort emails by receivedAt date (newest first) to match Gmail inbox order
  const sortedEmails = emails.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
  
  console.log(`✅ Successfully retrieved ${sortedEmails.length} UNREAD emails from last 3 days`);
  if (sortedEmails.length > 0) {
    const oldestEmail = sortedEmails[sortedEmails.length - 1];
    const newestEmail = sortedEmails[0];
    console.log(`📅 Date range: ${oldestEmail.receivedAt.toLocaleDateString()} to ${newestEmail.receivedAt.toLocaleDateString()}`);
  }
  
  return sortedEmails;
}

export async function markEmailAsRead(refreshToken: string, gmailMessageId: string) {
  try {
    const gmail = await getGmailClient(refreshToken);
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: gmailMessageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
    
    console.log(`📧 Marked email ${gmailMessageId} as read in Gmail`);
    return true;
  } catch (error) {
    console.error('Failed to mark email as read in Gmail:', error);
    return false;
  }
}

export async function markMultipleEmailsAsRead(refreshToken: string, gmailMessageIds: string[]) {
  try {
    const gmail = await getGmailClient(refreshToken);
    
    // Gmail API allows batch modification of up to 1000 messages
    const batchSize = 1000;
    const results = [];
    
    for (let i = 0; i < gmailMessageIds.length; i += batchSize) {
      const batch = gmailMessageIds.slice(i, i + batchSize);
      
      const result = await gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids: batch,
          removeLabelIds: ['UNREAD']
        }
      });
      
      results.push(result);
      console.log(`📧 Marked ${batch.length} emails as read in Gmail (batch ${Math.floor(i / batchSize) + 1})`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to mark multiple emails as read in Gmail:', error);
    return false;
  }
}