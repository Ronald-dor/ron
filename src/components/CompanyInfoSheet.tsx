
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CompanyInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from './ui/scroll-area';

const companyInfoSchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório."),
  addressStreet: z.string().min(1, "Rua é obrigatória."),
  addressNumber: z.string().min(1, "Número é obrigatório."),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().min(1, "Bairro é obrigatório."),
  addressCity: z.string().min(1, "Cidade é obrigatória."),
  addressState: z.string().min(1, "Estado é obrigatório.").length(2, "Estado deve ter 2 caracteres (ex: SP)."),
  addressZip: z.string().min(8, "CEP deve ter 8 dígitos.").regex(/^\d{5}-?\d{3}$/, "Formato de CEP inválido (XXXXX-XXX ou XXXXXXXX)."),
  phone: z.string().min(10, "Telefone é obrigatório.").regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato de telefone inválido (XX) XXXXX-XXXX."),
  email: z.string().email("Email inválido."),
  cnpj: z.string().optional().refine(val => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val), {
    message: "Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX)."
  }),
});

type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;

interface CompanyInfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyInfo) => void;
  initialData?: CompanyInfo | null;
}

const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, '');
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength === 0) return "";
  if (phoneNumberLength <= 2) return `(${phoneNumber}`;
  if (phoneNumberLength <= 6) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  if (phoneNumberLength <= 10) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6, 10)}`;
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`; // For 9-digit mobile
};

const formatZipCode = (value: string): string => {
  if (!value) return value;
  const zip = value.replace(/\D/g, '');
  if (zip.length <= 5) return zip;
  return `${zip.slice(0, 5)}-${zip.slice(5, 8)}`;
};

const formatCnpj = (value: string): string => {
  if (!value) return value;
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0,2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) return `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5)}`;
  if (cnpj.length <= 12) return `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8)}`;
  return `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12,14)}`;
};


export function CompanyInfoSheet({ isOpen, onClose, onSave, initialData }: CompanyInfoSheetProps) {
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: initialData || {
      name: '',
      addressStreet: '',
      addressNumber: '',
      addressComplement: '',
      addressNeighborhood: '',
      addressCity: '',
      addressState: '',
      addressZip: '',
      phone: '',
      email: '',
      cnpj: '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = (data: CompanyInfoFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <SheetContent className="sm:max-w-lg w-[90vw] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Informações da Empresa</SheetTitle>
          <SheetDescription>
            Esses dados serão utilizados nos recibos gerados.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl><Input placeholder="SuitUp Aluguel de Ternos" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ (Opcional)</FormLabel>
                    <FormControl><Input 
                      placeholder="XX.XXX.XXX/XXXX-XX" 
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                      maxLength={18}
                    /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <h3 className="text-md font-medium border-t pt-4 mt-4">Endereço</h3>
              <FormField
                control={form.control}
                name="addressStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua/Avenida</FormLabel>
                    <FormControl><Input placeholder="Rua Exemplo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="addressNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl><Input placeholder="123" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressComplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl><Input placeholder="Apto 101" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="addressNeighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl><Input placeholder="Centro" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="addressCity"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl><Input placeholder="São Paulo" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl><Input placeholder="SP" {...field} maxLength={2} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="addressZip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl><Input 
                      placeholder="XXXXX-XXX" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(formatZipCode(e.target.value))}
                      maxLength={9}
                    /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <h3 className="text-md font-medium border-t pt-4 mt-4">Contato</h3>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl><Input 
                      placeholder="(XX) XXXXX-XXXX" 
                      {...field} 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                      maxLength={15}
                    /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="contato@empresa.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="p-6 border-t mt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </SheetClose>
                <Button type="submit">Salvar Informações</Button>
              </SheetFooter>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
