import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>Raporty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Moduł raportowania - w budowie</p>
        </CardContent>
      </Card>
    </div>
  );
}
