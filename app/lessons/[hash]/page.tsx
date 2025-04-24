import { ArrowLeft, BookOpen, Code, Coins, Lock, Network, FileText, Book, GraduationCap, Lightbulb, Rocket, Shield, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { getLesson } from "../../../app/pinata";
import { notFound } from "next/navigation";
import { docs_v1, google } from 'googleapis';

// Map of icon names to components
const iconMap = {
  BookOpen,
  Code,
  Coins,
  Lock,
  Network,
  FileText,
  Book,
  GraduationCap,
  Lightbulb,
  Rocket,
  Shield,
  Terminal,
  Zap
};

interface Lesson {
  title: string;
  unit: string;
  author: string;
  createdAt?: string;
  content: string;
  icon?: string;
  googleDocsUrl?: string;
}

// Function to extract document ID from Google Docs URL
function extractDocumentId(url: string): string | null {
  // Regex to match Google Docs URL patterns and extract the document ID
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function convertDocsContentToHtml(document: docs_v1.Schema$Document): string {
  if (!document.body?.content) {
    return '';
  }
  
  // Step 1: Reconstruct the full document content
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
      // Mark the end of this paragraph
      paragraphBreaks.push(currentPosition);
    }
  });
  
  // Step 2: Pre-process special formatting blocks
  interface SpecialBlock {
    start: number;
    end: number;
    type: 'heading' | 'subheading' | 'hr' | 'code' | 'link';
    content: string;
    originalText: string;
  }
  
  const specialBlocks: SpecialBlock[] = [];
  
  // Regexes for detecting special blocks
  const headingRegex = /{{h}}(.*?){{\/h}}/g;
  const subheadingRegex = /{{sh}}(.*?){{\/sh}}/g;
  const hrRegex = /{{hr}}/g;
  const codeStartRegex = /{{code}}/g;
  const codeEndRegex = /{{\/code}}/g;
  const linkRegex = /{{a}}(.*?)\|(.*?){{\/a}}/g;
  
  // Find and process all special blocks
  let match;
  
  // Process headings
  while ((match = headingRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'heading',
      content: match[1],
      originalText: match[0]
    });
  }
  
  // Process subheadings
  while ((match = subheadingRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'subheading',
      content: match[1],
      originalText: match[0]
    });
  }
  
  // Process horizontal rules
  while ((match = hrRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'hr',
      content: '',
      originalText: match[0]
    });
  }
  
  // Process code blocks
  let codeBlockOpen = false;
  let codeStartIndex = -1;
  
  // Reset lastIndex to ensure we search from the beginning
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
  
  // Process links
  while ((match = linkRegex.exec(fullContent)) !== null) {
    specialBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'link',
      content: JSON.stringify({ url: match[1], text: match[2] }),
      originalText: match[0]
    });
  }
  
  // Sort blocks by start position
  specialBlocks.sort((a, b) => a.start - b.start);
  
  // Step 3: Generate HTML
  let html = '';
  let lastPosition = 0;
  let skipUntilPosition = -1;
  
  // Process the document paragraph by paragraph
  for (let i = 0; i <= paragraphBreaks.length; i++) {
    const paragraphEnd = i < paragraphBreaks.length ? paragraphBreaks[i] : fullContent.length;
    
    // Skip this paragraph if we're inside a special block that spans multiple paragraphs
    if (skipUntilPosition > lastPosition) {
      lastPosition = paragraphEnd;
      continue;
    }
    
    // Get the paragraph text
    let paragraphContent = fullContent.substring(lastPosition, paragraphEnd);
    let paragraphProcessed = false;
    
    // Get blocks that start or end in this paragraph
    const blocksInParagraph = specialBlocks.filter(block => 
      (block.start >= lastPosition && block.start < paragraphEnd) ||
      (block.end > lastPosition && block.end <= paragraphEnd) ||
      (block.start < lastPosition && block.end > paragraphEnd)
    );
    
    // Handle blocks in this paragraph
    for (const block of blocksInParagraph) {
      // For blocks that start in this paragraph
      if (block.start >= lastPosition && block.start < paragraphEnd) {
        // Add text before the block
        const textBeforeBlock = fullContent.substring(lastPosition, block.start);
        if (textBeforeBlock.trim()) {
          html += `<p class="mb-4">${textBeforeBlock}</p>`;
        }
        
        // Add the block content
        if (block.type === 'code') {
          html += `<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${block.content}</code></pre>`;
          paragraphProcessed = true;
        } else if (block.type === 'heading') {
          html += `<h2 class="text-3xl font-bold my-6">${block.content}</h2>`;
          paragraphProcessed = true;
        } else if (block.type === 'subheading') {
          html += `<h3 class="text-2xl font-semibold my-4">${block.content}</h3>`;
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
        
        // If the block extends beyond this paragraph, skip until the end of the block
        if (block.end > paragraphEnd) {
          skipUntilPosition = block.end;
        } else {
          // Otherwise, continue with text after the block in this paragraph
          lastPosition = block.end;
        }
      }
    }
    
    // If no blocks or only link blocks were processed, add the paragraph content
    if (!paragraphProcessed && paragraphContent.trim()) {
      html += `<p class="mb-4">${paragraphContent}</p>`;
    }
    
    lastPosition = paragraphEnd;
  }
  
  return html;
}

export default async function LessonPage({ 
  params,
  searchParams 
}: { 
  params: { hash: string },
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const { hash } = params;
  
  try {
    const lesson = await getLesson(hash) as Lesson;
    
    // Get the icon component based on the lesson's icon name
    const IconComponent = lesson.icon && lesson.icon in iconMap 
      ? iconMap[lesson.icon as keyof typeof iconMap] 
      : BookOpen;
    
    // Initialize Google Docs content
    let docsContent = null;
    
    // Fetch Google Docs content if URL exists
    if (lesson.googleDocsUrl) {
      try {
        // Set up auth - in production, use OAuth2 or service account
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
          
          // Extract document ID from the URL
          const documentId = extractDocumentId(lesson.googleDocsUrl);
          
          if (documentId) {
            // Fetch the document content
            const { data } = await docs.documents.get({
              documentId,
            });
            
            // Convert Google Docs content to HTML
            docsContent = convertDocsContentToHtml(data);
          }
        }
      } catch (error) {
        console.error("Error fetching Google Docs content:", error);
        // Fallback to simple content if available
      }
    }
    
    return (
      <main className="container mx-auto px-8 py-4 md:py-24">
        <Header />
        <div className="flex justify-between items-center mb-12">
          <Link href={`/lessons/${hash}/study`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <p className="text-xl font-semibold">Quiz Me</p>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl flex items-center gap-3">
              <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              {lesson.title}
            </h1>
            <p>{lesson.unit}</p>
            <div className="flex items-center text-muted-foreground">
              <p>By: {lesson.author}</p>
              {lesson.createdAt && (
                <p className="ml-4">
                  Created: {new Date(lesson.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {docsContent ? (
            <div className="prose prose-lg dark:prose-invert max-w-none border rounded-lg p-8 shadow-md">
              <div dangerouslySetInnerHTML={{ __html: docsContent }} />
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error(`Error retrieving lesson with hash ${hash}:`, error);
    notFound();
  }
}