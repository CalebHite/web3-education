import { ArrowLeft, BookOpen, Code, Coins, Lock, Network, FileText, Book, GraduationCap, Lightbulb, Rocket, Shield, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { getLesson } from "../../../app/pinata";
import { notFound } from "next/navigation";

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

export default async function LessonPage({ params }: LessonPageProps) {
  const { hash } = params;
  
  try {
    const lesson = await getLesson(hash);
    
    // Get the icon component based on the lesson's icon name
    const IconComponent = lesson.icon && lesson.icon in iconMap 
      ? iconMap[lesson.icon as keyof typeof iconMap] 
      : BookOpen;
    
    return (
      <main className="container mx-auto px-8 py-4 md:py-24">
        <Link href="/lessons" className="flex items-center mb-12 hover:text-blue-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl flex items-center gap-3">
              <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              {lesson.title}
            </h1>
            <div className="flex items-center text-muted-foreground">
              <p>By: {lesson.author}</p>
              {lesson.createdAt && (
                <p className="ml-4">
                  Created: {new Date(lesson.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {lesson.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              IPFS Hash: {lesson.ipfsHash}
            </p>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(`Error retrieving lesson with hash ${hash}:`, error);
    notFound();
  }
} 