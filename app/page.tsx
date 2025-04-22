import { ArrowRight, BookOpenText, GraduationCap, Code } from "lucide-react"
import Link from "next/link"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          Kansas Blockchain Education
        </h1>
        <div className="flex justify-center">
          <img src="/kubi-rgb.png" className="w-60"></img>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Explore the world of blockchain technology and earn KUBIX tokens while learning
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Lessons
            </CardTitle>
            <CardDescription>Learn about blockchain and earn KUBIX</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Our interactive lessons cover everything from blockchain basics to advanced concepts. Complete lessons to
              earn KUBIX tokens and track your progress.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/lessons">
                Open Lessons <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/50 dark:to-rose-950/50">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-red-600 dark:text-rose-400" />
              Smart Contract Sandbox
            </CardTitle>
            <CardDescription>Learn about smart contracts in an easy to use environment</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Experiment with smart contracts in our user-friendly sandbox environment. Write, deploy, and test your
              contracts without any risk.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/contract-builder">
                Open Sandbox <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-600 dark:to-amber-600">
            <CardTitle className="flex items-center gap-2">
              <BookOpenText  className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Resources
            </CardTitle>
            <CardDescription>Educational web3 resources</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              This collection of educational and informational resources is designed to assist your Web3 journey.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full mt-6">
              <Link href="/resources">
                View Resources <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

