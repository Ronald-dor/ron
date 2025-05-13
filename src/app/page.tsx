
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Suit } from '@/types';
import { mockSuits } from '@/data/mockData';
import { AppHeader } from '@/components/AppHeader';
import { SuitCard } from '@/components/SuitCard';
import { SuitForm } from '@/components/SuitForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle as ReminderCardTitle } from '@/components/ui/card'; // Renamed to avoid conflict
import { useToast } from "@/hooks/use-toast";
import { exportSuitsToCSV } from '@/lib/export';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BellRing } from 'lucide-react';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomePage() {
  const [suits, setSuits] = useState<Suit[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSuit, setEditingSuit] = useState<Suit | null>(null);
  const [suitToDelete, setSuitToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    setSuits(mockSuits.map(suit => ({ 
      ...suit, 
      id: suit.id || crypto.randomUUID(), 
      photoUrl: suit.photoUrl || "",
      // Ensure customer fields are at least empty strings if not present in mock data
      customerName: suit.customerName || "",
      customerPhone: suit.customerPhone || "",
      customerEmail: suit.customerEmail || "",
    })));
  }, []);

  const upcomingReturnSuits = useMemo(() => {
    if (!isMounted) return [];
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return suits.filter(suit => {
      if (!suit.returnDate || !suit.customerName) return false; 
  
      try {
        const returnDateObj = parseISO(suit.returnDate);
        const diffInDays = differenceInCalendarDays(returnDateObj, today);
        return diffInDays === 0 || diffInDays === 1; // Today or Tomorrow
      } catch (e) {
        console.error("Erro ao analisar data de devolução para lembrete:", suit.returnDate, e);
        return false;
      }
    });
  }, [suits, isMounted]);

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
    const processedSuitData = { 
      ...suitData, 
      photoUrl: suitData.photoUrl || "",
      // Ensure customer fields from form are passed
      customerName: suitData.customerName,
      customerPhone: suitData.customerPhone,
      customerEmail: suitData.customerEmail,
    };

    if (editingSuit) {
      setSuits(prevSuits => prevSuits.map(s => (s.id === processedSuitData.id ? processedSuitData : s)));
      toast({ title: "Terno Atualizado", description: `${processedSuitData.name} foi atualizado.` });
    } else {
      setSuits(prevSuits => [...prevSuits, { ...processedSuitData, id: crypto.randomUUID() }]);
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

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader onAddSuit={() => {}} onExportCSV={() => {}} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Carregando catálogo...</p>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onAddSuit={handleAddSuit} onExportCSV={handleExportCSV} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isMounted && upcomingReturnSuits.length > 0 && (
          <div className="mb-8 p-4 border rounded-lg shadow-md bg-card">
            <h2 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <BellRing className="mr-2 h-5 w-5" /> Lembretes de Devolução (Hoje ou Amanhã)
            </h2>
            <div className="space-y-3">
              {upcomingReturnSuits.map(suit => (
                <Card key={`reminder-${suit.id}`} className="p-4 bg-secondary/20">
                  <ReminderCardTitle className="text-md font-semibold mb-1">{suit.name} <span className="text-sm font-normal text-muted-foreground">(Cód: {suit.code})</span></ReminderCardTitle>
                  <CardContent className="p-0 text-sm space-y-0.5">
                    <p><strong>Cliente:</strong> {suit.customerName}</p>
                    <p><strong>Data de Devolução:</strong> <span className="font-semibold text-destructive">{format(parseISO(suit.returnDate!), "PPP", { locale: ptBR })}</span></p>
                    {suit.customerPhone && <p><strong>Telefone:</strong> {suit.customerPhone}</p>}
                    {suit.customerEmail && <p><strong>Email:</strong> {suit.customerEmail}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {suits.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-muted-foreground">Seu catálogo está vazio.</h2>
            <p className="text-muted-foreground mt-2">Clique em "Adicionar Terno" para começar a montar sua coleção.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suits.map(suit => (
              <SuitCard key={suit.id} suit={suit} onEdit={handleEditSuit} onDelete={handleDeleteSuit} />
            ))}
          </div>
        )}
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
    </div>
  );
}

