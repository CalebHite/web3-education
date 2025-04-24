import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Header() {
    return <div>
        <Link href="/" className="flex items-center mb-12 hover:text-blue-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>
    </div>
}