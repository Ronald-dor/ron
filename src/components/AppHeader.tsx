
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { PlusCircle, Download, LogOut } from "lucide-react";
import { logout } from "@/app/login/actions"; // Import the server action

type AppHeaderProps = {
  onAddSuit: () => void;
  onExportCSV: () => void;
};

export function AppHeader({ onAddSuit, onExportCSV }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            SuitUp Aluguel
          </h1>
        </div>
        <div className="flex items-center gap-3"> {/* Increased gap slightly for new button */}
          <Button onClick={onAddSuit} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Terno
          </Button>
          <Button onClick={onExportCSV} size="sm">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
