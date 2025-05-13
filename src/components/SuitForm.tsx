
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Suit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";

const suitFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  code: z.string().min(1, { message: "O código é obrigatório." }),
  photoUrl: z.string().optional(),
  purchaseDate: z.date({ required_error: "A data da compra é obrigatória." }),
  suitPrice: z.coerce.number().min(0, { message: "O preço do terno deve ser positivo." }),
  rentalPrice: z.coerce.number().min(0, { message: "O preço do aluguel deve ser positivo." }),
  deliveryDate: z.date().optional(),
  returnDate: z.date().optional(),
  observations: z.string().optional(),
  customerName: z.string().min(1, { message: "O nome do cliente é obrigatório." }),
  customerPhone: z.string().min(1, { message: "O telefone do cliente é obrigatório." }),
  customerEmail: z.string().email({ message: "Endereço de e-mail inválido." }).min(1, {message: "O e-mail do cliente é obrigatório."}),
});

type SuitFormValues = z.infer<typeof suitFormSchema>;

interface SuitFormProps {
  onSubmit: (data: Suit) => void;
  initialData?: Suit | null;
  onCancel: () => void;
}

export function SuitForm({ onSubmit, initialData, onCancel }: SuitFormProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const memoizedDefaultValues = React.useMemo(() => {
    return initialData
      ? {
          ...initialData,
          photoUrl: initialData.photoUrl || "",
          purchaseDate: initialData.purchaseDate ? parseISO(initialData.purchaseDate) : new Date(),
          deliveryDate: initialData.deliveryDate ? parseISO(initialData.deliveryDate) : undefined,
          returnDate: initialData.returnDate ? parseISO(initialData.returnDate) : undefined,
          customerName: initialData.customerName || "",
          customerPhone: initialData.customerPhone || "",
          customerEmail: initialData.customerEmail || "",
        }
      : {
          name: "",
          code: "",
          photoUrl: "",
          purchaseDate: new Date(),
          suitPrice: 0,
          rentalPrice: 0,
          observations: "",
          customerName: "",
          customerPhone: "",
          customerEmail: "",
        };
  }, [initialData]);

  const form = useForm<SuitFormValues>({
    resolver: zodResolver(suitFormSchema),
    defaultValues: memoizedDefaultValues,
  });

  React.useEffect(() => {
    // Reset form with potentially new initialData or cleared data.
    // This includes resetting the file input if it's programmatically controlled or for UX.
    form.reset(memoizedDefaultValues);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form.reset]); // memoizedDefaultValues is not needed here as it's a dependency of the outer effect
                                 // and form.reset is stable. Adding memoizedDefaultValues directly can cause loops.
                                 // The issue was form.reset being part of the dep array, which is fine, but the
                                 // memoizedDefaultValues recalculation on initialData change and then form.reset
                                 // could be problematic if not handled carefully. Let's simplify the dep array.
                                 // Corrected: useEffect depends on initialData changing, which rebuilds memoizedDefaultValues, then form.reset.

  const handleSubmit = (data: SuitFormValues) => {
    const submittedSuit: Suit = {
      ...data,
      id: initialData?.id || crypto.randomUUID(),
      photoUrl: data.photoUrl || "", // Ensure photoUrl is string
      purchaseDate: format(data.purchaseDate, "yyyy-MM-dd"),
      deliveryDate: data.deliveryDate ? format(data.deliveryDate, "yyyy-MM-dd") : undefined,
      returnDate: data.returnDate ? format(data.returnDate, "yyyy-MM-dd") : undefined,
    };
    onSubmit(submittedSuit);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleCancel = () => {
    onCancel();
    // No need to form.reset here if Dialog onOpenChange handles it,
    // but if called directly, resetting is good.
    // form.reset(memoizedDefaultValues); // Reset to initial state on cancel
    // if (fileInputRef.current) {
    //     fileInputRef.current.value = "";
    // }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Terno</FormLabel>
                <FormControl><Input placeholder="Ex: Smoking Clássico Preto" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl><Input placeholder="Ex: S001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Terno</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        toast({ variant: "destructive", title: "Arquivo Muito Grande", description: "Por favor, selecione uma imagem menor que 5MB." });
                        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the file input
                        field.onChange(form.getValues("photoUrl") || ""); // Revert to previous or empty
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        field.onChange(reader.result as string);
                      };
                      reader.onerror = () => {
                        // Preserve existing photoUrl on error, or clear if it was a new attempt
                        field.onChange(form.getValues("photoUrl") || "");
                        toast({ variant: "destructive", title: "Erro de Upload", description: "Não foi possível carregar a imagem." });
                      }
                      reader.readAsDataURL(file);
                    } else {
                       // If no file is selected (e.g., user cancels file dialog), retain current value or empty.
                       // This prevents clearing an existing image if the user clicks "browse" then "cancel".
                       field.onChange(form.getValues("photoUrl") || "");
                    }
                  }}
                  // value={undefined} // We don't control 'value' for file inputs directly
                />
              </FormControl>
              {field.value && ( // field.value here is the data URI string
                <div className="mt-2">
                  <Image
                    src={field.value}
                    alt="Pré-visualização do terno"
                    width={100}
                    height={125}
                    className="rounded-md object-cover aspect-[3/4]"
                    data-ai-hint="suit preview"
                    onError={(e) => {
                        // This might indicate a problem with the data URI or network if it's a URL.
                        // For robustness, we could clear field.value or show a placeholder.
                        // (e.target as HTMLImageElement).style.display = 'none'; 
                        toast({variant: "destructive", title: "Erro de Visualização", description: "Não foi possível exibir a imagem de pré-visualização."})
                    }}
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Compra</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="suitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço do Terno (R$)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rentalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço do Aluguel (R$)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-medium border-t pt-4 mt-6">Informações do Aluguel (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Entrega</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Devolução</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl><Textarea placeholder="Ex: Pedidos especiais, notas sobre condição" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <h3 className="text-lg font-medium border-t pt-4 mt-6">Informações do Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl><Input placeholder="João Silva" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do Cliente</FormLabel>
                <FormControl><Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email do Cliente</FormLabel>
                <FormControl><Input type="email" placeholder="nome@exemplo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button type="submit">{initialData ? "Salvar Alterações" : "Adicionar Terno"}</Button>
        </div>
      </form>
    </Form>
  );
}

