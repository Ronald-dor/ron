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
    // In a real app, fetch data here. For now, use mock data.
    // Simulating data load and giving unique IDs if they are missing for mock data
    setSuits(mockSuits.map(suit => ({ ...suit, id: suit.id || crypto.randomUUID() })));
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
      toast({ title: "Suit Deleted", description: "The suit has been removed from the catalog." });
    }
    setSuitToDelete(null);
  };

  const handleFormSubmit = (suitData: Suit) => {
    if (editingSuit) {
      setSuits(prevSuits => prevSuits.map(s => (s.id === suitData.id ? suitData : s)));
      toast({ title: "Suit Updated", description: `${suitData.name} has been updated.` });
    } else {
      setSuits(prevSuits => [...prevSuits, { ...suitData, id: crypto.randomUUID() }]);
      toast({ title: "Suit Added", description: `${suitData.name} has been added to the catalog.` });
    }
    setIsFormOpen(false);
    setEditingSuit(null);
  };

  const handleExportCSV = () => {
    if (suits.length === 0) {
      toast({ title: "Export Catalog", description: "Catalog is empty. Nothing to export.", variant: "destructive" });
      return;
    }
    exportSuitsToCSV(suits);
    toast({ title: "Export Successful", description: "Suit catalog has been exported as CSV." });
  };

  if (!isMounted) {
    // Optional: return a loading skeleton or null to avoid hydration mismatch for client-side only data
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader onAddSuit={() => {}} onExportCSV={() => {}} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Loading catalog...</p>
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
            <h2 className="text-2xl font-semibold text-muted-foreground">Your catalog is empty.</h2>
            <p className="text-muted-foreground mt-2">Click "Add Suit" to start building your collection.</p>
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
          if (!isOpen) setEditingSuit(null);
        }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{editingSuit ? 'Edit Suit' : 'Add New Suit'}</DialogTitle>
            <DialogDescription>
              {editingSuit ? 'Update the details of this suit.' : 'Enter the details for the new suit.'}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the suit from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSuitToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSuit}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
