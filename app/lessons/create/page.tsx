"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, Code, Coins, Lock, Network, Plus, FileText, Book, GraduationCap, Lightbulb, Rocket, Shield, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { uploadLesson } from "../../../app/pinata";
import { useRouter } from "next/navigation";

// Create an object mapping icon names to their components
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

export default function CreateLessonPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    icon: "BookOpen", // Default icon
    notionUrl: "" // Notion page URL
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: string) => {
    setFormData((prev) => ({ ...prev, icon: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload lesson to Pinata
      const uploadedLesson = await uploadLesson(formData);
      console.log("Lesson uploaded successfully:", uploadedLesson);
      
      // Redirect to lessons page
      router.push("/lessons");
    } catch (error) {
      console.error("Error uploading lesson:", error);
      alert("Failed to upload lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected icon component
  const SelectedIcon = iconMap[formData.icon as keyof typeof iconMap];

  return (
    <main className="container mx-auto px-8 py-4 md:py-24">
      <Link href="/lessons" className="flex items-center mb-12 hover:text-blue-500">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          Create New Lesson
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Add a new lesson to our blockchain curriculum
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>Fill in the details for your new lesson</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter lesson title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Lesson Icon</Label>
                <div className="flex items-center space-x-2">
                  <Select value={formData.icon} onValueChange={handleIconChange}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select an icon">
                        {formData.icon && (
                          <div className="flex items-center">
                            {SelectedIcon && <SelectedIcon className="mr-2 h-4 w-4" />}
                            <span>{formData.icon}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(iconMap).map(([name, Icon]) => (
                        <SelectItem key={name} value={name} className="cursor-pointer">
                          <div className="flex items-center">
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Description</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter short description of lesson"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notionUrl">Notion Page URL</Label>
                <Input
                  id="notionUrl"
                  name="notionUrl"
                  value={formData.notionUrl}
                  onChange={handleChange}
                  placeholder="https://your-notion-page-url.com"
                  type="url"
                />
              </div>
            </CardContent>
            <CardFooter className="mt-4">
              <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Create Lesson"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
} 