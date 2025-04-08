"use client";

import { useState, useEffect } from "react";
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
    googleDocsUrl: "", // Google Docs URL
    authKey: "", // Authentication key
    unit: "" // Unit selection
  });
  const [createNewUnit, setCreateNewUnit] = useState(false);
  const [error, setError] = useState("");

  const VALID_AUTH_KEY = process.env.NEXT_PUBLIC_AUTH_KEY; // The required authentication key
  const [units, setUnits] = useState<string[]>(["Blockchain Basics", "Smart Contracts", "Web3 Development"]); // Prefilled with example units

  // Fetch existing units
  useEffect(() => {
    // Replace with actual API call to fetch units
    // For example: fetchUnits().then(data => setUnits(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: string) => {
    setFormData((prev) => ({ ...prev, icon: value }));
  };

  const handleUnitChange = (value: string) => {
    if (value === "create-new") {
      setCreateNewUnit(true);
      setFormData((prev) => ({ ...prev, unit: "" }));
    } else {
      setCreateNewUnit(false);
      setFormData((prev) => ({ ...prev, unit: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.unit) {
      setError("Please select a unit before creating a lesson.");
      return;
    }
    // Validate authentication key
    if (formData.authKey !== VALID_AUTH_KEY) {
      alert("Invalid authentication key. Please enter the correct key to create a lesson.");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalFormData = {
        ...formData,
      };

      // Upload lesson to Pinata
      const uploadedLesson = await uploadLesson(finalFormData);
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
      <div className="flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center hover:text-blue-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
      {error && (
        <div className="text-center py-2 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      )}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          Create a New Lesson
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Fill out the form below to add a new lesson to the curriculum.
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
                <Label htmlFor="googleDocsUrl">Google Docs URL</Label>
                <Input
                  id="googleDocsUrl"
                  name="googleDocsUrl"
                  value={formData.googleDocsUrl}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/document/d/..."
                  type="url"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authKey">Authentication Key</Label>
                <Input
                  id="authKey"
                  name="authKey"  
                  value={formData.authKey}
                  onChange={handleChange}
                  placeholder="Enter authentication key"
                  type="password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                {!createNewUnit ? (
                  <Select value={formData.unit} onValueChange={handleUnitChange}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit} className="cursor-pointer">
                          {unit}
                        </SelectItem>
                      ))}
                      <SelectItem value="create-new" className="cursor-pointer">
                        <div className="flex items-center text-blue-500">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Unit
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="Enter new unit name"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full mb-2"
                      onClick={() => setCreateNewUnit(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full cursor-pointer" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Lesson..." : "Create Lesson"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}