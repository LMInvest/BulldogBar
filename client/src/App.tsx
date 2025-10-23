import { Route, Switch } from "wouter";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { PrivateRoute } from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import DeliveriesPage from "./pages/DeliveriesPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/login" component={LoginPage} />

        <Route path="/">
          {() => <PrivateRoute component={DashboardPage} />}
        </Route>

        <Route path="/products">
          {() => <PrivateRoute component={ProductsPage} />}
        </Route>

        <Route path="/inventory">
          {() => <PrivateRoute component={InventoryPage} />}
        </Route>

        <Route path="/deliveries">
          {() => <PrivateRoute component={DeliveriesPage} />}
        </Route>

        <Route path="/reports">
          {() => <PrivateRoute component={ReportsPage} />}
        </Route>

        <Route path="/users">
          {() => <PrivateRoute component={UsersPage} />}
        </Route>

        <Route component={NotFoundPage} />
      </Switch>

      <Toaster />
    </AuthProvider>
  );
}

export default App;
