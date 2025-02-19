import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-12 text-center">
      {/* Welcome Message */}
      <div className="text-8xl font-bold font-fraunces">
        Welcome to Arbor Coup!
      </div>

      {/* Auth Buttons */}
      <div className="flex justify-center gap-6">
        <Link href="/sign-in">
          <Button variant="secondary" size="lg" className="font-semibold text-lg">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="default" size="lg" className="font-semibold text-lg">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}
