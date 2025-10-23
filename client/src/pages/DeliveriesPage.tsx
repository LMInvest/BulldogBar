import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function DeliveriesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>Dostawy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Moduł zarządzania dostawami - w budowie</p>
        </CardContent>
      </Card>
    </div>
  );
}
