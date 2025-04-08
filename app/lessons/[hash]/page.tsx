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

interface LessonPageProps {
  params: {
    hash: string;
  };
}

// Function to extract document ID from Google Docs URL
function extractDocumentId(url: string): string | null {
  // Regex to match Google Docs URL patterns and extract the document ID
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Function to convert Google Docs content to HTML
function convertDocsContentToHtml(document: docs_v1.Schema$Document): string {
  let html = '';
  
  if (!document.body?.content) {
    return html;
  }
  
  // Process each structural element
  document.body.content.forEach(element => {
    if (element.paragraph) {
      html += '<p>';
      
      // Process each text run in the paragraph
      element.paragraph.elements?.forEach(textElement => {
        if (textElement.textRun) {
          const text = textElement.textRun.content || '';
          const textStyle = textElement.textRun.textStyle || {};
          
          // Apply basic styling
          let styledText = text;
          if (textStyle.bold) styledText = `<strong>${styledText}</strong>`;
          if (textStyle.italic) styledText = `<em>${styledText}</em>`;
          if (textStyle.underline) styledText = `<u>${styledText}</u>`;
          
          html += styledText;
        }
      });
      
      html += '</p>';
    } else if (element.table) {
      // Handle tables (simplified)
      html += '<table class="border-collapse border my-4">';
      // Table processing would go here
      html += '</table>';
    } else if (element.sectionBreak) {
      html += '<hr class="my-4">';
    }
  });
  
  return html;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { hash } = params;
  
  try {
    const lesson = await getLesson(hash);
    
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
          
        if (!credentials || !credentials.client_email) {
          console.error("Google credentials are missing or invalid");
          // Continue without Google Docs content
        } else {
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
        <div className="flex justify-between items-center mb-12">
          <Link href="/lessons" className="flex items-center hover:text-blue-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
          </Link>
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