import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>Produkty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Moduł zarządzania produktami - w budowie</p>
        </CardContent>
      </Card>
    </div>
  );
}
