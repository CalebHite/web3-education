import { ArrowRight, BookOpen, Code, Coins, Lock, Network } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"

// Define the lesson data structure
type Lesson = {
  id: string
  title: string
  description: string
  content: string
  icon: React.ReactNode
  gradientFrom: string
  gradientTo: string
  iconColor: string
  iconDarkColor: string
  path: string
}

// Lesson data array
const lessons: Lesson[] = [
  {
    id: "basics",
    title: "Blockchain Basics",
    description: "Introduction to blockchain technology",
    content: "Learn the fundamentals of blockchain technology, including distributed ledgers, consensus mechanisms, and the history of cryptocurrencies.",
    icon: <BookOpen className="h-5 w-5" />,
    gradientFrom: "from-blue-50",
    gradientTo: "to-indigo-50",
    iconColor: "text-blue-600",
    iconDarkColor: "dark:text-blue-400",
    path: "/lessons/basics"
  },
  {
    id: "smart-contracts",
    title: "Smart Contracts",
    description: "Learn to build on blockchain",
    content: "Master the art of smart contract development. Learn Solidity, understand contract security, and deploy your first dApp.",
    icon: <Code className="h-5 w-5" />,
    gradientFrom: "from-green-50",
    gradientTo: "to-emerald-50",
    iconColor: "text-green-600",
    iconDarkColor: "dark:text-green-400",
    path: "/lessons/smart-contracts"
  },
  {
    id: "tokenomics",
    title: "Tokenomics",
    description: "Understanding token economics",
    content: "Explore token design, distribution models, and economic incentives in blockchain systems. Learn how to create sustainable token economies.",
    icon: <Coins className="h-5 w-5" />,
    gradientFrom: "from-purple-50",
    gradientTo: "to-violet-50",
    iconColor: "text-purple-600",
    iconDarkColor: "dark:text-purple-400",
    path: "/lessons/tokenomics"
  },
  {
    id: "security",
    title: "Security & Privacy",
    description: "Protecting blockchain assets",
    content: "Learn about blockchain security, private key management, and best practices for protecting your digital assets.",
    icon: <Lock className="h-5 w-5" />,
    gradientFrom: "from-amber-50",
    gradientTo: "to-orange-50",
    iconColor: "text-amber-600",
    iconDarkColor: "dark:text-amber-400",
    path: "/lessons/security"
  },
  {
    id: "defi",
    title: "DeFi Fundamentals",
    description: "Decentralized Finance basics",
    content: "Explore the world of decentralized finance. Learn about lending protocols, decentralized exchanges, and yield farming.",
    icon: <Network className="h-5 w-5" />,
    gradientFrom: "from-cyan-50",
    gradientTo: "to-teal-50",
    iconColor: "text-cyan-600",
    iconDarkColor: "dark:text-cyan-400",
    path: "/lessons/defi"
  },
  {
    id: "advanced",
    title: "Advanced Development",
    description: "Take your skills to the next level",
    content: "Dive into advanced blockchain development concepts, including layer 2 solutions, cross-chain bridges, and scaling techniques.",
    icon: <Code className="h-5 w-5" />,
    gradientFrom: "from-rose-50",
    gradientTo: "to-pink-50",
    iconColor: "text-rose-600",
    iconDarkColor: "dark:text-rose-400",
    path: "/lessons/advanced"
  }
]

export default function LessonsPage() {
  return (
    <main className="container mx-auto px-8 py-4 md:py-24">
    <Link href="/" className="flex items-center mb-12 hover:text-blue-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          Blockchain Lessons
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Explore our comprehensive curriculum and earn KUBIX tokens as you learn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className={`bg-gradient-to-r ${lesson.gradientFrom} ${lesson.gradientTo} dark:${lesson.gradientFrom.replace('50', '950/50')} dark:${lesson.gradientTo.replace('50', '950/50')}`}>
              <CardTitle className="flex items-center gap-2">
                <span className={`${lesson.iconColor} ${lesson.iconDarkColor}`}>
                  {lesson.icon}
                </span>
                {lesson.title}
              </CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>{lesson.content}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={lesson.path}>
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
