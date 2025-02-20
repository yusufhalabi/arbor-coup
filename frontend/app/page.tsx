import { ThreeDPhotoCarousel } from "@/components/carousel";
import Hero from "@/components/hero";

export default async function Home() {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat fixed inset-0"
      style={{ 
        backgroundImage: 'url("/images/background.png")',
        backgroundAttachment: 'fixed',
        height: '100vh',
        width: '100vw',
        backgroundSize: 'cover',
      }}
    >
      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-between min-h-screen">
        {/* Carousel Section - Reduced top padding */}
        <div className="relative z-10 w-full flex items-center justify-center h-[60vh]
                      pt-8 md:pt-12 lg:pt-16 hidden lg:flex">
          <ThreeDPhotoCarousel />
        </div>

        {/* Hero Section with Welcome Message and Buttons */}
        <div className="relative w-full h-[40vh] flex items-center justify-center">
          <Hero />
        </div>
      </div>
    </div>
  );
}
