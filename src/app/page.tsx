
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Suit, CompanyInfo } from '@/types';
import { mockSuits } from '@/data/mockData';
import { AppHeader } from '@/components/AppHeader';
import { SuitCard } from '@/components/SuitCard';
import { SuitForm } from '@/components/SuitForm';
import { CompanyInfoSheet } from '@/components/CompanyInfoSheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle as ReminderCardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { exportSuitsToCSV } from '@/lib/export';
import { generateReceiptPDF } from '@/lib/pdfGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BellRing, Edit, Trash2, FileText, PackageCheck, PackageSearch, Archive, Handshake, CheckCircle2, Clock, Search as SearchIcon } from 'lucide-react';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';

const defaultCompanyInfo: CompanyInfo = {
  name: 'SuitUp Aluguel de Ternos',
  logoUrl: '',
  addressStreet: 'Rua Principal',
  addressNumber: '123',
  addressComplement: 'Sala 10',
  addressNeighborhood: 'Centro',
  addressCity: 'Sua Cidade',
  addressState: 'UF',
  addressZip: '00000-000',
  phone: '(XX) XXXXX-XXXX',
  email: 'contato@suitup.com',
  cnpj: 'XX.XXX.XXX/0001-XX',
  receiptCustomTextTitle: 'Observações Adicionais',
  receiptCustomText: 'Obrigado por escolher nossos serviços! Para dúvidas ou informações, entre em contato.',
  receiptShowCompanyName: true,
  receiptShowCnpj: true,
  receiptShowCustomerEmail: true,
  receiptShowCustomerPhone: true,
  receiptShowRentalObservations: true,
  receiptLogoHeight: 20,
  receiptTableTheme: 'striped',
};

export default function HomePage() {
  const [suits, setSuits] = useState<Suit[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSuit, setEditingSuit] = useState<Suit | null>(null);
  const [suitToDelete, setSuitToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCompanySheetOpen, setIsCompanySheetOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    setSuits(mockSuits.map(suit => ({
      ...suit,
      id: suit.id || crypto.randomUUID(),
      photoUrl: suit.photoUrl || "",
      customerName: suit.customerName || undefined,
      customerPhone: suit.customerPhone || undefined,
      customerEmail: suit.customerEmail || undefined,
      deliveryDate: suit.deliveryDate || undefined,
      returnDate: suit.returnDate || undefined,
      observations: suit.observations || undefined,
      isReturned: suit.isReturned || false,
    })));

    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      try {
        const parsedInfo = JSON.parse(storedCompanyInfo);
        setCompanyInfo({ ...defaultCompanyInfo, ...parsedInfo });
      } catch (error) {
        console.error("Erro ao carregar informações da empresa do localStorage:", error);
        setCompanyInfo(defaultCompanyInfo); // Fallback para os padrões se houver erro
      }
    } else {
      setCompanyInfo(defaultCompanyInfo);
    }
  }, []);

  const handleSaveCompanyInfo = (data: CompanyInfo) => {
    setCompanyInfo(data);
    localStorage.setItem('companyInfo', JSON.stringify(data));
    toast({ title: "Informações da Empresa Salvas", description: "Os dados da sua empresa foram atualizados." });
  };

  const upcomingReturnSuitsForNotification = useMemo(() => {
    if (!isMounted) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return suits.filter(suit => {
      if (!suit.returnDate || !suit.customerName || suit.isReturned) return false;
      try {
        const returnDateObj = parseISO(suit.returnDate);
        const diffInDays = differenceInCalendarDays(returnDateObj, today);
        return diffInDays === 0 || diffInDays === 1;
      } catch (e) {
        console.error("Erro ao analisar data de devolução para lembrete:", suit.returnDate, e);
        return false;
      }
    });
  }, [suits, isMounted]);

  const filterSuitsByName = (suitList: Suit[]) => {
    if (searchTerm.trim() === "") {
      return suitList;
    }
    return suitList.filter(suit =>
      suit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const disponiveisSuits = useMemo(() => {
    if (!isMounted) return [];
    const filtered = suits.filter(suit => !suit.customerName || suit.isReturned);
    return filterSuitsByName(filtered);
  }, [suits, isMounted, searchTerm]);

  const alugadosSuits = useMemo(() => {
    if (!isMounted) return [];
    const filtered = suits
      .filter(suit => suit.customerName && !suit.isReturned)
      .sort((a, b) => (b.deliveryDate && a.deliveryDate ? parseISO(b.deliveryDate).getTime() - parseISO(a.deliveryDate).getTime() : 0));
    return filterSuitsByName(filtered);
  }, [suits, isMounted, searchTerm]);

  const pendingSuits = useMemo(() => {
    if (!isMounted) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = suits
      .filter(suit => {
        if (!suit.customerName || suit.isReturned || !suit.returnDate) return false;
        try {
          const returnDateObj = parseISO(suit.returnDate);
          return differenceInCalendarDays(returnDateObj, today) < 0;
        } catch (e) {
          console.error("Erro ao analisar data de devolução para atrasados:", suit.returnDate, e);
          return false;
        }
      })
      .sort((a, b) => (a.returnDate && b.returnDate ? parseISO(a.returnDate).getTime() - parseISO(b.returnDate).getTime() : 0));
    return filterSuitsByName(filtered);
  }, [suits, isMounted, searchTerm]);

  const returnedSuits = useMemo(() => {
    if (!isMounted) return [];
    const filtered = suits
      .filter(suit => suit.customerName && suit.isReturned)
      .sort((a,b) => (b.returnDate && a.returnDate ? parseISO(b.returnDate).getTime() - parseISO(a.returnDate).getTime() : 0));
    return filterSuitsByName(filtered);
  }, [suits, isMounted, searchTerm]);


  const getDaysRemainingText = (returnDateStr: string | undefined): string => {
    if (!returnDateStr) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      const returnDateObj = parseISO(returnDateStr);
      const diff = differenceInCalendarDays(returnDateObj, today);

      if (diff < 0) return `Atrasado (${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''})`;
      if (diff === 0) return 'Hoje';
      if (diff === 1) return 'Amanhã';
      return `Em ${diff} dias`;
    } catch (e) {
      console.error("Erro ao calcular dias restantes:", returnDateStr, e);
      return "Data inválida";
    }
  };


  const handleAddSuit = () => {
    setEditingSuit(null);
    setIsFormOpen(true);
  };

  const handleEditSuit = (suit: Suit) => {
    setEditingSuit(suit);
    setIsFormOpen(true);
  };

  const handleDeleteSuit = (suitId: string) => {
    setSuitToDelete(suitId);
  };

  const confirmDeleteSuit = () => {
    if (suitToDelete) {
      setSuits(prevSuits => prevSuits.filter(suit => suit.id !== suitToDelete));
      toast({ title: "Terno Excluído", description: "O terno foi removido do catálogo." });
    }
    setSuitToDelete(null);
  };

  const handleFormSubmit = (suitData: Suit) => {
    const processedSuitData: Suit = {
      ...suitData,
      id: suitData.id || crypto.randomUUID(),
      photoUrl: suitData.photoUrl || "",
      isReturned: suitData.isReturned || false,
    };
    if (!processedSuitData.customerName) {
      processedSuitData.isReturned = false;
    }

    if (editingSuit) {
      setSuits(prevSuits => prevSuits.map(s => (s.id === processedSuitData.id ? processedSuitData : s)));
      toast({ title: "Terno Atualizado", description: `${processedSuitData.name} foi atualizado.` });
    } else {
      setSuits(prevSuits => [...prevSuits, processedSuitData]);
      toast({ title: "Terno Adicionado", description: `${processedSuitData.name} foi adicionado ao catálogo.` });
    }
    setIsFormOpen(false);
    setEditingSuit(null);
  };

  const handleExportCSV = () => {
    if (suits.length === 0) {
      toast({ title: "Exportar Catálogo", description: "O catálogo está vazio. Nada para exportar.", variant: "destructive" });
      return;
    }
    exportSuitsToCSV(suits);
    toast({ title: "Exportação Bem-sucedida", description: "O catálogo de ternos foi exportado como CSV." });
  };

  const handleGenerateReceipt = (suit: Suit) => {
    if (!companyInfo) {
       toast({ title: "Erro ao Gerar Recibo", description: `Informações da empresa não configuradas.`, variant: "destructive" });
       return;
    }
    if (suit.customerName) {
      generateReceiptPDF(suit, companyInfo);
      toast({ title: "Recibo Gerado", description: `O recibo para ${suit.name} foi gerado.` });
    } else {
      toast({ title: "Erro ao Gerar Recibo", description: `Não há informações de aluguel para ${suit.name}.`, variant: "destructive" });
    }
  };

  const handleToggleReturnStatus = (suitToToggle: Suit) => {
    setSuits(prevSuits =>
      prevSuits.map(s =>
        s.id === suitToToggle.id ? { ...s, isReturned: !s.isReturned } : s
      )
    );
    toast({
      title: "Status Atualizado",
      description: `O terno ${suitToToggle.name} foi marcado como ${!suitToToggle.isReturned ? 'Devolvido' : 'Pendente'}.`,
    });
  };


  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader onAddSuit={() => {}} onExportCSV={() => {}} onOpenCompanySettings={() => {}} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Carregando catálogo...</p>
        </main>
      </div>
    );
  }

  const renderSuitList = (suitList: Suit[], emptyMessage: string, emptySubMessage: string) => {
    if (suitList.length === 0) {
      return (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-muted-foreground">{emptyMessage}</h2>
          <p className="text-muted-foreground mt-2">{emptySubMessage}</p>
          {searchTerm && <p className="text-sm text-muted-foreground mt-1">(Termo pesquisado: "{searchTerm}")</p>}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {suitList.map(suit => (
          <SuitCard
            key={suit.id}
            suit={suit}
            onEdit={handleEditSuit}
            onDelete={handleDeleteSuit}
            isForAvailableCatalog={true}
          />
        ))}
      </div>
    );
  };

  const renderRentalSuitCard = (suit: Suit) => (
      <Card key={`rental-${suit.id}`} className="p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-start">
          {suit.photoUrl && (
            <div className="w-full sm:w-24 h-32 sm:h-auto sm:aspect-[3/4] relative bg-muted rounded overflow-hidden flex-shrink-0">
                <Image src={suit.photoUrl} alt={suit.name} className="w-full h-full object-cover" data-ai-hint="suit fashion" fill />
            </div>
          )}
        <div className="flex-grow">
          <CardHeader className="p-0 mb-2">
              <ReminderCardTitle className="text-lg font-semibold">{suit.name} <span className="text-sm font-normal text-muted-foreground">(Cód: {suit.code})</span></ReminderCardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm space-y-1">
            <p><strong>Cliente:</strong> {suit.customerName}</p>
            <p><strong>Data de Devolução:</strong> <span className={`font-semibold ${!suit.isReturned && suit.returnDate && differenceInCalendarDays(parseISO(suit.returnDate), new Date().setHours(0,0,0,0)) < 0 ? 'text-destructive' : (suit.isReturned ? 'text-green-600' : '')}`}>{suit.returnDate ? format(parseISO(suit.returnDate), "PPP", { locale: ptBR }) : "N/A"}</span> {!suit.isReturned && suit.returnDate && `(${getDaysRemainingText(suit.returnDate)})`}</p>
            <p><strong>Preço do Aluguel:</strong> R$ {suit.rentalPrice.toFixed(2).replace('.', ',')}</p>
            {suit.customerPhone && <p><strong>Telefone:</strong> {suit.customerPhone}</p>}
            {suit.customerEmail && <p><strong>Email:</strong> {suit.customerEmail}</p>}
             {suit.isReturned ? (
                <p className="text-xs font-semibold text-green-600">Status: Devolvido</p>
            ) : (
                <p className="text-xs font-semibold text-yellow-600">Status: Pendente</p>
            )}
            {suit.observations && <p className="mt-1 text-xs"><strong>Obs:</strong> {suit.observations}</p>}
          </CardContent>
        </div>
        <div className="mt-3 sm:mt-0 flex flex-col gap-2 flex-shrink-0 self-start sm:self-center">
              <Button variant="outline" size="sm" onClick={() => handleEditSuit(suit)} className="w-full sm:w-auto">
                <Edit className="mr-1 h-4 w-4" /> Editar
              </Button>
              {!suit.isReturned ? (
                <Button variant="outline" size="sm" onClick={() => handleToggleReturnStatus(suit)} className="w-full sm:w-auto">
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Marcar Devolvido
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => handleToggleReturnStatus(suit)} className="w-full sm:w-auto">
                    <Clock className="mr-1 h-4 w-4" /> Marcar Pendente
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => handleGenerateReceipt(suit)} className="w-full sm:w-auto">
                <FileText className="mr-1 h-4 w-4" /> Gerar Recibo
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteSuit(suit.id)} className="w-full sm:w-auto">
                  <Trash2 className="mr-1 h-4 w-4" /> Excluir
              </Button>
        </div>
      </Card>
  );


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onAddSuit={handleAddSuit} onExportCSV={handleExportCSV} onOpenCompanySettings={() => setIsCompanySheetOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isMounted && upcomingReturnSuitsForNotification.length > 0 && (
          <div className="mb-8 p-4 border rounded-lg shadow-md bg-card">
            <h2 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <BellRing className="mr-2 h-5 w-5" /> Lembretes de Devolução (Hoje ou Amanhã)
            </h2>
            <div className="space-y-3">
              {upcomingReturnSuitsForNotification.map(suit => (
                <Card key={`reminder-${suit.id}`} className="p-4 bg-secondary/20">
                  <ReminderCardTitle className="text-md font-semibold mb-1">{suit.name} <span className="text-sm font-normal text-muted-foreground">(Cód: {suit.code})</span></ReminderCardTitle>
                  <CardContent className="p-0 text-sm space-y-0.5">
                    <p><strong>Cliente:</strong> {suit.customerName}</p>
                    <p><strong>Data de Devolução:</strong> <span className="font-semibold text-destructive">{suit.returnDate ? format(parseISO(suit.returnDate), "PPP", { locale: ptBR }) : "N/A"}</span> {suit.returnDate && `(${getDaysRemainingText(suit.returnDate)})`}</p>
                    {suit.customerPhone && <p><strong>Telefone:</strong> {suit.customerPhone}</p>}
                    {suit.customerEmail && <p><strong>Email:</strong> {suit.customerEmail}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Pesquisar por nome do terno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        <Tabs defaultValue="all-suits" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 mx-auto md:max-w-xl lg:max-w-2xl">
            <TabsTrigger value="all-suits" className="flex items-center gap-2"><Archive className="h-4 w-4" />Disponíveis</TabsTrigger>
            <TabsTrigger value="alugados-suits" className="flex items-center gap-2"><Handshake className="h-4 w-4" />Alugados</TabsTrigger>
            <TabsTrigger value="pending-suits" className="flex items-center gap-2"><PackageSearch className="h-4 w-4" />Atrasados</TabsTrigger>
            <TabsTrigger value="returned-suits" className="flex items-center gap-2"><PackageCheck className="h-4 w-4" />Devolvidos</TabsTrigger>
          </TabsList>

          <TabsContent value="all-suits">
            {renderSuitList(disponiveisSuits, "Nenhum terno disponível no momento.", searchTerm ? "Nenhum terno encontrado com este nome." : "Adicione novos ternos ou aguarde devoluções.")}
          </TabsContent>

          <TabsContent value="alugados-suits">
            {alugadosSuits.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-muted-foreground">Nenhum terno alugado no momento.</h2>
                <p className="text-muted-foreground mt-2">{searchTerm ? "Nenhum terno alugado encontrado com este nome." : "Não há ternos atualmente em processo de aluguel."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alugadosSuits.map(suit => renderRentalSuitCard(suit))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending-suits">
            {pendingSuits.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-muted-foreground">Nenhum terno com devolução atrasada.</h2>
                <p className="text-muted-foreground mt-2">{searchTerm ? "Nenhum terno atrasado encontrado com este nome." : "Não há ternos aguardando devolução que já passaram do prazo."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSuits.map(suit => renderRentalSuitCard(suit))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="returned-suits">
            {returnedSuits.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold text-muted-foreground">Nenhum terno devolvido.</h2>
                <p className="text-muted-foreground mt-2">{searchTerm ? "Nenhum terno devolvido encontrado com este nome." : "Não há registros de ternos devolvidos."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returnedSuits.map(suit => renderRentalSuitCard(suit))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingSuit(null);
          }
        }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{editingSuit ? 'Editar Terno' : 'Adicionar Novo Terno'}</DialogTitle>
            <DialogDescription>
              {editingSuit ? 'Atualize os detalhes deste terno.' : 'Insira os detalhes para o novo terno.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <SuitForm
              onSubmit={handleFormSubmit}
              initialData={editingSuit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingSuit(null);
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!suitToDelete} onOpenChange={() => setSuitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o terno do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSuitToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSuit}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CompanyInfoSheet
        isOpen={isCompanySheetOpen}
        onClose={() => setIsCompanySheetOpen(false)}
        onSave={handleSaveCompanyInfo}
        initialData={companyInfo}
      />
    </div>
  );
}
