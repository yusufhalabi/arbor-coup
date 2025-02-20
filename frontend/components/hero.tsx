import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StreetButton } from "@/components/ui/street-button";

export default function Hero() {
  return (
    <div className="relative z-10 flex flex-col tracking-tighter items-center justify-center gap-6 lg:gap-12 text-center">
      {/* Welcome Message */}
      <div className="text-4xl lg:text-8xl font-recoletaBold text-michiganBlue opacity-80">
        Welcome to Arbor Coup!
      </div>

      {/* Auth Buttons */}
      <div className="flex justify-center gap-4 lg:gap-6 mt-4 lg:mt-0">
        <Link href="/sign-in">
          <StreetButton variant="secondary" size="lg">
            Sign In
          </StreetButton>
        </Link>
        <Link href="/sign-up">
          <StreetButton variant="default" size="lg">
            Sign Up
          </StreetButton>
        </Link>
      </div>
    </div>
  );
}
