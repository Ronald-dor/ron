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
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email({ message: "Endereço de e-mail inválido." }).optional().or(z.literal("")),
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
    form.reset(memoizedDefaultValues);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [memoizedDefaultValues, form.reset]);


  const handleSubmit = (data: SuitFormValues) => {
    const submittedSuit: Suit = {
      ...data,
      id: initialData?.id || crypto.randomUUID(),
      photoUrl: data.photoUrl || "",
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
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    form.reset(memoizedDefaultValues);
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
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        field.onChange(reader.result as string);
                      };
                      reader.onerror = () => {
                        field.onChange(initialData?.photoUrl || memoizedDefaultValues.photoUrl || "");
                        toast({ variant: "destructive", title: "Erro de Upload", description: "Não foi possível carregar a imagem." });
                      }
                      reader.readAsDataURL(file);
                    } else {
                      field.onChange(memoizedDefaultValues.photoUrl || "");
                    }
                  }}
                />
              </FormControl>
              {field.value && (
                <div className="mt-2">
                  <Image
                    src={field.value}
                    alt="Pré-visualização do terno"
                    width={100}
                    height={125}
                    className="rounded-md object-cover aspect-[3/4]"
                    data-ai-hint="suit preview"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
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
        <h3 className="text-lg font-medium border-t pt-4 mt-6">Informações do Cliente (Opcional)</h3>
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