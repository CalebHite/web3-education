"use client";

import { ArrowRight, BookOpen, Code, Coins, Lock, Network, Plus, FileText, Book, GraduationCap, Lightbulb, Rocket, Shield, Terminal, Zap } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { getAllLessons } from "../../app/pinata"
import { useEffect, useState } from "react"

// Define the base lesson data structure from the API
type BaseLesson = {
  id?: string
  title: string
  content: string
  author: string
  icon?: string
  ipfsHash?: string
  createdAt?: Date
  updatedAt?: Date
  unit?: string
}

// Define the UI-enhanced lesson type
type EnhancedLesson = BaseLesson & {
  description?: string
  iconElement?: React.ReactNode
  gradientFrom?: string
  gradientTo?: string
  iconColor?: string
  iconDarkColor?: string
  path?: string
  unitPath?: string
}

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

// Default icons and styles for lessons
const getLessonIcon = (iconName?: string) => {
  if (iconName && iconName in iconMap) {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return <IconComponent className="h-5 w-5" />;
  }
  return <BookOpen className="h-5 w-5" />; // Default icon
};

const getLessonStyles = (index: number) => {
  const styles = [
    { gradientFrom: "from-blue-50", gradientTo: "to-indigo-50", iconColor: "text-blue-600", iconDarkColor: "dark:text-blue-400" },
    { gradientFrom: "from-green-50", gradientTo: "to-emerald-50", iconColor: "text-green-600", iconDarkColor: "dark:text-green-400" },
    { gradientFrom: "from-purple-50", gradientTo: "to-violet-50", iconColor: "text-purple-600", iconDarkColor: "dark:text-purple-400" },
    { gradientFrom: "from-amber-50", gradientTo: "to-orange-50", iconColor: "text-amber-600", iconDarkColor: "dark:text-amber-400" },
    { gradientFrom: "from-cyan-50", gradientTo: "to-teal-50", iconColor: "text-cyan-600", iconDarkColor: "dark:text-cyan-400" },
    { gradientFrom: "from-rose-50", gradientTo: "to-pink-50", iconColor: "text-rose-600", iconDarkColor: "dark:text-rose-400" },
  ];
  return styles[index % styles.length];
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<EnhancedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        console.log("Starting to fetch lessons...");
        setIsLoading(true);
        const fetchedLessons = await getAllLessons();
        
        // Enhance lessons with UI properties
        const enhancedLessons = fetchedLessons.map((lesson, index) => {
          const styles = getLessonStyles(index);
          return {
            ...lesson,
            iconElement: getLessonIcon(lesson.icon),
            description: lesson.content.substring(0, 100) + "...",
            path: `/lessons/units/${lesson.unit}/${lesson.ipfsHash}`,
            unitPath: `/lessons/units/${lesson.unit}`,
            ...styles
          };
        });
        
        setLessons(enhancedLessons);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("Failed to load lessons. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return (
    <main className="container mx-auto px-8 py-4 md:py-24">
      <div className="flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center hover:text-blue-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
      
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          Blockchain Lessons
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Explore our comprehensive curriculum and earn KUBIX tokens as you learn
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg">Loading lessons...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg">No lessons found...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.ipfsHash} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className={`bg-gradient-to-r ${lesson.gradientFrom} ${lesson.gradientTo} dark:${lesson.gradientFrom?.replace('50', '950/50')} dark:${lesson.gradientTo?.replace('50', '950/50')}`}>
                <CardTitle className="flex items-center gap-2">
                  <span className={`${lesson.iconColor} ${lesson.iconDarkColor}`}>
                    {lesson.iconElement}
                  </span>
                  {lesson.title}
                </CardTitle>
                {lesson.unit && (
                  <p className="text-sm text-muted-foreground font-semibold">{lesson.unit}</p>
                )}
                <CardDescription>{lesson.content}</CardDescription>
              </CardHeader>
              <CardContent className="">
                <p className="text-sm text-muted-foreground">By: {lesson.author}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={lesson.path || "#"}>
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
