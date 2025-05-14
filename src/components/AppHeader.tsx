
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { PlusCircle, Download, LogOut, Settings } from "lucide-react";
import { logout } from "@/app/login/actions"; 

type AppHeaderProps = {
  onAddSuit: () => void;
  onExportCSV: () => void;
  onOpenCompanySettings: () => void;
};

export function AppHeader({ onAddSuit, onExportCSV, onOpenCompanySettings }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            SuitUp Aluguel
          </h1>
        </div>
        <div className="flex items-center gap-2"> 
          <Button onClick={onAddSuit} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Terno
          </Button>
          <Button onClick={onExportCSV} size="sm">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
           <Button onClick={onOpenCompanySettings} variant="outline" size="icon" title="Configurações da Empresa">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configurações da Empresa</span>
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
