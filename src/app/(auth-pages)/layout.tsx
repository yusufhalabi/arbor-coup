
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      
        {/* Auth Content Container */}
        <div className="relative flex min-h-screen items-center justify-center p-4">
          {/* Card Container */}
            <div className="w-full max-w-md rounded-lg bg-white/90 backdrop-blur-sm p-8 shadow-xl">
              {children}
            </div>
        </div>
    </div>
  );
} 
