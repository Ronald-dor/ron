"use client";

import React, { useState, useEffect } from 'react';
import type { Suit } from '@/types';
import { mockSuits } from '@/data/mockData';
import { AppHeader } from '@/components/AppHeader';
import { SuitCard } from '@/components/SuitCard';
import { SuitForm } from '@/components/SuitForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { exportSuitsToCSV } from '@/lib/export';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const [suits, setSuits] = useState<Suit[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSuit, setEditingSuit] = useState<Suit | null>(null);
  const [suitToDelete, setSuitToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    // Simulating data load and giving unique IDs if they are missing for mock data
    // Ensuring photoUrl is always at least an empty string for consistency
    setSuits(mockSuits.map(suit => ({ ...suit, id: suit.id || crypto.randomUUID(), photoUrl: suit.photoUrl || "" })));
  }, []);

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
    // Ensure photoUrl is always a string, defaulting to empty if undefined/null from form
    const processedSuitData = { ...suitData, photoUrl: suitData.photoUrl || "" };

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
              initialData={editingSuit} // Pass null or Suit object
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
