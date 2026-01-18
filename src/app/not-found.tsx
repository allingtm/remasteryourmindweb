import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-8xl md:text-9xl font-bold text-gradient">404</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mt-4 mb-2">
          Page not found
        </p>
        <p className="text-base text-muted-foreground/80 mb-8 max-w-md mx-auto">
          Looks like this page wandered off into the void.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
}
