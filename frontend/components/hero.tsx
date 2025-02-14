export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <h1 className="text3xl"> Welcome to Arbor Coup </h1> 
        <span className="border-l rotate-45 h-6" />
      </div>
      <h1 className="sr-only">Arbor Coup</h1>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
