import { docs_v1, google } from 'googleapis';
import Header from '@/components/Header';

// Function to extract document ID from Google Docs URL
function extractDocumentId(url: string): string | null {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function convertDocsContentToHtml(document: docs_v1.Schema$Document): string {
  if (!document.body?.content) {
    
    return '';
  }
  
  let fullContent = '';
  let paragraphBreaks: number[] = [];
  let currentPosition = 0;
  
  document.body.content.forEach(element => {
    if (element.paragraph) {
      element.paragraph.elements?.forEach(textElement => {
        if (textElement.textRun) {
          const text = textElement.textRun.content || '';
          fullContent += text;
          currentPosition += text.length;
        }
      });
      paragraphBreaks.push(currentPosition);
    }
  });
  
  interface SpecialBlock {
    start: number;
    end: number;
    type: 'heading' | 'subheading' | 'hr' | 'code' | 'link';
    content: string;
    originalText: string;
  }
  
  const specialBlocks: SpecialBlock[] = [];
  
  const headingRegex = /{{h}}(.*?){{\/h}}/g;
  const subheadingRegex = /{{sh}}(.*?){{\/sh}}/g;
  const hrRegex = /{{hr}}/g;
  const codeStartRegex = /{{code}}/g;
  const codeEndRegex = /{{\/code}}/g;
  const linkRegex = /{{a}}(.*?)\|(.*?){{\/a}}/g;
  
  let match;
  
  while ((match = headingRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'heading',
      content: match[1],
      originalText: match[0]
    });
  }
  
  while ((match = subheadingRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'subheading',
      content: match[1],
      originalText: match[0]
    });
  }
  
  while ((match = hrRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'hr',
      content: '',
      originalText: match[0]
    });
  }
  
  codeStartRegex.lastIndex = 0;
  codeEndRegex.lastIndex = 0;
  
  while ((match = codeStartRegex.exec(fullContent)) !== null) {
    const endMatch = codeEndRegex.exec(fullContent);
    
    if (endMatch) {
      const codeContent = fullContent.substring(
        match.index + match[0].length,
        endMatch.index
      ).trim();
      
      specialBlocks.push({
        start: match.index,
        end: endMatch.index + endMatch[0].length,
        type: 'code',
        content: codeContent,
        originalText: fullContent.substring(match.index, endMatch.index + endMatch[0].length)
      });
    }
  }
  
  while ((match = linkRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'link',
      content: JSON.stringify({ url: match[1], text: match[2] }),
      originalText: match[0]
    });
  }
  
  specialBlocks.sort((a, b) => a.start - b.start);
  
  let html = '';
  let lastPosition = 0;
  let skipUntilPosition = -1;
  
  for (let i = 0; i <= paragraphBreaks.length; i++) {
    const paragraphEnd = i < paragraphBreaks.length ? paragraphBreaks[i] : fullContent.length;
    
    if (skipUntilPosition > lastPosition) {
      lastPosition = paragraphEnd;
      continue;
    }
    
    let paragraphContent = fullContent.substring(lastPosition, paragraphEnd);
    let paragraphProcessed = false;
    
    const blocksInParagraph = specialBlocks.filter(block => 
      (block.start >= lastPosition && block.start < paragraphEnd) ||
      (block.end > lastPosition && block.end <= paragraphEnd) ||
      (block.start < lastPosition && block.end > paragraphEnd)
    );
    
    for (const block of blocksInParagraph) {
      if (block.start >= lastPosition && block.start < paragraphEnd) {
        const textBeforeBlock = fullContent.substring(lastPosition, block.start);
        if (textBeforeBlock.trim()) {
          html += `<p class="mb-4">${textBeforeBlock}</p>`;
        }
        
        if (block.type === 'code') {
          html += `<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${block.content}</code></pre>`;
          paragraphProcessed = true;
        } else if (block.type === 'heading') {
          html += `<h2 class="text-2xl font-bold my-6">${block.content}</h2>`;
          paragraphProcessed = true;
        } else if (block.type === 'subheading') {
          html += `<h3 class="text-xl font-semibold my-4">${block.content}</h3>`;
          paragraphProcessed = true;
        } else if (block.type === 'hr') {
          html += `<hr class="my-8 border-t-2 border-gray-300">`;
          paragraphProcessed = true;
        } else if (block.type === 'link') {
          try {
            const linkData = JSON.parse(block.content);
            const linkHtml = `<a href="${linkData.url}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`;
            paragraphContent = paragraphContent.replace(block.originalText, linkHtml);
          } catch (e) {
            console.error('Error processing link:', e);
          }
        }
        
        if (block.end > paragraphEnd) {
          skipUntilPosition = block.end;
        } else {
          lastPosition = block.end;
        }
      }
    }
    
    if (!paragraphProcessed && paragraphContent.trim()) {
      html += `<p class="mb-4">${paragraphContent}</p>`;
    }
    
    lastPosition = paragraphEnd;
  }
  
  return html;
}

export default async function Resources() {
  const googleDocsUrl = "https://docs.google.com/document/d/1CkJKy_BhD-Glo3TJGK1KX-nfbZe5yEbtFv8y8T3qw0A/edit?usp=sharing";
  let docsContent = null;

  if (googleDocsUrl) {
    try {
      const credentials = process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS 
        ? JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS) 
        : null;
      
      if (credentials?.client_email) {
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/documents.readonly'],
        });
        
        const client = await auth.getClient();
        const docs = google.docs({ version: 'v1', auth: client as any });
        
        const documentId = extractDocumentId(googleDocsUrl);
        
        if (documentId) {
          const { data } = await docs.documents.get({
            documentId,
          });
          
          docsContent = convertDocsContentToHtml(data);
        }
      }
    } catch (error) {
      console.error("Error fetching Google Docs content:", error);
    }
  }

  return <main>
    <div className='mt-8 ml-8'>
    <Header />
    <h1 className="text-5xl font-bold my-6">Resources</h1>
    </div>
    {docsContent ? (
      <div className="prose prose-lg dark:prose-invert max-w-none rounded-lg p-8 pt-0 shadow-md">
        <div dangerouslySetInnerHTML={{ __html: docsContent }} />
      </div>
    ) : (
      <p>No content available.</p>
    )}
  </main>;
}