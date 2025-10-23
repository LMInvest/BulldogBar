import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardHeader>
          <CardTitle>Użytkownicy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Moduł zarządzania użytkownikami - w budowie</p>
        </CardContent>
      </Card>
    </div>
  );
}
