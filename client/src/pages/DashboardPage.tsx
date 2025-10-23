import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Package, BarChart3, Truck, Users } from "lucide-react";
import { formatRole } from "@/../../shared/utils";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BulldogBar Manager</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.role && formatRole(user.role)}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Witaj, {user?.firstName || user?.username}!</h2>
          <p className="text-muted-foreground">
            Zarządzaj swoim magazynem i monitoruj zapasy w czasie rzeczywistym
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produkty</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Wszystkie produkty w systemie</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Niski stan</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Produkty wymagające uzupełnienia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dostawy</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Oczekujące dostawy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Użytkownicy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Aktywni użytkownicy</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
              <CardDescription>Najczęściej używane funkcje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Dodaj produkt
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Truck className="mr-2 h-4 w-4" />
                Nowa dostawa
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generuj raport
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ostatnia aktywność</CardTitle>
              <CardDescription>Najnowsze zmiany w systemie</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Brak ostatnich aktywności</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
