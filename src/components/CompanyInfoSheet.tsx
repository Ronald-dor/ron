
"use client";

import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CompanyInfo, ReceiptTableTheme } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const companyInfoSchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório."),
  logoUrl: z.string().optional(),
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
  receiptCustomTextTitle: z.string().optional(),
  receiptCustomText: z.string().optional(),

  // PDF Customization Options
  receiptShowCnpj: z.boolean().optional(),
  receiptShowCustomerEmail: z.boolean().optional(),
  receiptShowCustomerPhone: z.boolean().optional(),
  receiptShowRentalObservations: z.boolean().optional(),
  receiptLogoHeight: z.coerce.number().positive("Altura do logo deve ser positiva.").optional(),
  receiptTableTheme: z.enum(['striped', 'grid', 'plain']).optional(),
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

const defaultCompanyInfoFormValues: CompanyInfoFormValues = {
    name: '',
    logoUrl: '',
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
    receiptCustomTextTitle: '',
    receiptCustomText: '',
    receiptShowCnpj: true,
    receiptShowCustomerEmail: true,
    receiptShowCustomerPhone: true,
    receiptShowRentalObservations: true,
    receiptLogoHeight: 20,
    receiptTableTheme: 'striped',
};

export function CompanyInfoSheet({ isOpen, onClose, onSave, initialData }: CompanyInfoSheetProps) {
  const { toast } = useToast();
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: initialData ? { ...defaultCompanyInfoFormValues, ...initialData } : defaultCompanyInfoFormValues,
  });

  const watchLogoUrl = form.watch("logoUrl");

  React.useEffect(() => {
    if (isOpen) {
        form.reset(initialData ? { ...defaultCompanyInfoFormValues, ...initialData } : defaultCompanyInfoFormValues);
        if (logoFileInputRef.current) {
            logoFileInputRef.current.value = "";
        }
    }
  }, [initialData, form, isOpen]);

  const handleSubmit = (data: CompanyInfoFormValues) => {
    const processedData: CompanyInfo = {
        ...data,
        logoUrl: data.logoUrl || undefined,
        receiptCustomTextTitle: data.receiptCustomTextTitle?.trim() || undefined,
        receiptCustomText: data.receiptCustomText?.trim() || undefined,
        receiptShowCnpj: data.receiptShowCnpj ?? true,
        receiptShowCustomerEmail: data.receiptShowCustomerEmail ?? true,
        receiptShowCustomerPhone: data.receiptShowCustomerPhone ?? true,
        receiptShowRentalObservations: data.receiptShowRentalObservations ?? true,
        receiptLogoHeight: data.receiptLogoHeight ?? 20,
        receiptTableTheme: data.receiptTableTheme ?? 'striped',
    }
    onSave(processedData);
    onClose();
  };

  const handleClearLogo = () => {
    form.setValue('logoUrl', '', { shouldValidate: true, shouldDirty: true });
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
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
        <ScrollArea className="h-[calc(100vh-150px)]"> 
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
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo da Empresa</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        ref={logoFileInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                              toast({ variant: "destructive", title: "Arquivo Muito Grande", description: "Por favor, selecione uma imagem menor que 2MB." });
                              if(logoFileInputRef.current) logoFileInputRef.current.value = "";
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.onerror = () => {
                              toast({ variant: "destructive", title: "Erro de Upload", description: "Não foi possível carregar a imagem do logo." });
                            }
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full"
                      />
                    </FormControl>
                    {watchLogoUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <Image
                          src={watchLogoUrl}
                          alt="Pré-visualização do logo"
                          width={80}
                          height={80}
                          className="rounded-md object-contain border"
                          data-ai-hint="company logo"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={handleClearLogo} aria-label="Limpar logo">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
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

              <h3 className="text-md font-medium border-t pt-4 mt-4">Personalização do Recibo</h3>
               <FormField
                control={form.control}
                name="receiptCustomTextTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Seção Personalizada no Recibo (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Ex: Termos e Condições" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiptCustomText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto Personalizado no Recibo (Opcional)</FormLabel>
                    <FormControl><Textarea placeholder="Insira aqui termos, condições, agradecimentos ou outras informações..." {...field} value={field.value || ''} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-md font-medium border-t pt-4 mt-4">Opções de Layout do Recibo</h3>
                <FormField
                    control={form.control}
                    name="receiptLogoHeight"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Altura do Logo no Recibo (mm)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || '20'}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione a altura do logo" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="15">Pequeno (15mm)</SelectItem>
                            <SelectItem value="20">Médio (20mm)</SelectItem>
                            <SelectItem value="25">Grande (25mm)</SelectItem>
                            <SelectItem value="30">Extra Grande (30mm)</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="receiptTableTheme"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tema da Tabela de Detalhes</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'striped'}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione um tema" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="striped">Listrado (Padrão)</SelectItem>
                            <SelectItem value="grid">Grade Completa</SelectItem>
                            <SelectItem value="plain">Simples (Sem linhas)</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="space-y-3">
                    <FormLabel>Campos Visíveis no Recibo</FormLabel>
                    <FormField
                        control={form.control}
                        name="receiptShowCnpj"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                            <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Mostrar CNPJ da Empresa</FormLabel>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="receiptShowCustomerPhone"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                            <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Mostrar Telefone do Cliente</FormLabel>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="receiptShowCustomerEmail"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                            <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Mostrar Email do Cliente</FormLabel>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="receiptShowRentalObservations"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                            <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="font-normal">Mostrar Observações do Aluguel</FormLabel>
                        </FormItem>
                        )}
                    />
                </div>


              <SheetFooter className="p-6 border-t mt-4 sticky bottom-0 bg-background">
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

