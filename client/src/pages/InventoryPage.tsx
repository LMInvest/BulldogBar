import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>Inwentarz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Moduł zarządzania inwentarzem - w budowie</p>
        </CardContent>
      </Card>
    </div>
  );
}
