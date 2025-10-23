import { Link } from "wouter";
import { Button } from "../components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8 text-muted-foreground">Strona nie została znaleziona</p>
        <Link href="/">
          <Button>Powrót do strony głównej</Button>
        </Link>
      </div>
    </div>
  );
}
