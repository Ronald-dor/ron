
"use client";

import React, { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Suit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { CameraCaptureDialog } from "./CameraCaptureDialog";

const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, '');
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength === 0) return "";
  if (phoneNumberLength <= 2) return `(${phoneNumber}`;
  if (phoneNumberLength <= 7) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  if (phoneNumberLength <= 11) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};


const suitFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  code: z.string().min(1, { message: "O código é obrigatório." }),
  photoUrl: z.string().optional(),
  purchaseDate: z.date({ required_error: "A data da compra é obrigatória." }),
  suitPrice: z.coerce.number().min(0, { message: "O preço do terno deve ser positivo." }),
  rentalPrice: z.coerce.number().min(0, { message: "O preço do aluguel deve ser positivo." }),
  isReturned: z.boolean().optional(),

  deliveryDate: z.date().optional(),
  returnDate: z.date().optional(),
  observations: z.string().optional(),

  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email({ message: "Formato de e-mail inválido." }).optional().or(z.literal('')),
})
.superRefine((data, ctx) => {
  const hasCustomerName = data.customerName && data.customerName.trim() !== "";
  const hasCustomerPhone = data.customerPhone && data.customerPhone.trim() !== "";
  const hasCustomerEmail = data.customerEmail && data.customerEmail.trim() !== "";

  const isAttemptingRental = data.deliveryDate || data.returnDate || hasCustomerName || hasCustomerPhone || hasCustomerEmail;

  if (isAttemptingRental) {
    if (!data.customerName || data.customerName.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O nome do cliente é obrigatório para registrar um aluguel.", path: ["customerName"] });
    }
    if (!data.customerPhone || data.customerPhone.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O telefone do cliente é obrigatório para registrar um aluguel.", path: ["customerPhone"] });
    } else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(data.customerPhone)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Formato de telefone inválido. Use (XX) XXXXX-XXXX.", path: ["customerPhone"] });
    }
    if (!data.customerEmail || data.customerEmail.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "O e-mail do cliente é obrigatório para registrar um aluguel.", path: ["customerEmail"] });
    } else {
        const emailCheck = z.string().email("Endereço de e-mail inválido.").safeParse(data.customerEmail);
        if (!emailCheck.success) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Endereço de e-mail inválido.", path: ["customerEmail"] });
        }
    }
    if (!data.deliveryDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A data de entrega é obrigatória para aluguel.", path: ["deliveryDate"] });
    }
    if (!data.returnDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A data de devolução é obrigatória para aluguel.", path: ["returnDate"] });
    }
  }

  if (data.deliveryDate && data.returnDate && data.returnDate < data.deliveryDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A data de devolução não pode ser anterior à data de entrega.",
      path: ["returnDate"],
    });
  }
})
.transform(data => ({
    ...data,
    customerName: (data.customerName && data.customerName.trim() !== "") ? data.customerName.trim() : undefined,
    customerPhone: (data.customerPhone && data.customerPhone.trim() !== "") ? data.customerPhone.trim() : undefined,
    customerEmail: (data.customerEmail && data.customerEmail.trim() !== "") ? data.customerEmail.trim() : undefined,
    observations: (data.observations && data.observations.trim() !== "") ? data.observations.trim() : undefined,
    photoUrl: (data.photoUrl && data.photoUrl.trim() !== "") ? data.photoUrl.trim() : undefined,
    isReturned: (data.customerName && data.customerName.trim() !== "") ? (data.isReturned ?? false) : false,
}));


type SuitFormValues = z.infer<typeof suitFormSchema>;

// Helper function to derive default form values
const getDefaultSuitFormValues = (suit?: Suit | null): SuitFormValues => {
  const now = new Date(); // Use a consistent 'now' for defaults
  return {
    name: suit?.name || "",
    code: suit?.code || "",
    photoUrl: suit?.photoUrl || "",
    purchaseDate: suit?.purchaseDate ? parseISO(suit.purchaseDate) : now,
    suitPrice: suit?.suitPrice ?? 0,
    rentalPrice: suit?.rentalPrice ?? 0,
    isReturned: suit?.isReturned ?? false,
    deliveryDate: suit?.deliveryDate ? parseISO(suit.deliveryDate) : undefined,
    returnDate: suit?.returnDate ? parseISO(suit.returnDate) : undefined,
    observations: suit?.observations || "",
    customerName: suit?.customerName || "",
    customerPhone: suit?.customerPhone || "",
    customerEmail: suit?.customerEmail || "",
  };
};

interface SuitFormProps {
  onSubmit: (data: Suit) => void;
  initialData?: Suit | null;
  onCancel: () => void;
}

export function SuitForm({ onSubmit, initialData, onCancel }: SuitFormProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

  const form = useForm<SuitFormValues>({
    resolver: zodResolver(suitFormSchema),
    defaultValues: getDefaultSuitFormValues(initialData),
  });

  const watchCustomerName = form.watch("customerName");
  const watchPhotoUrl = form.watch("photoUrl");

  React.useEffect(() => {
    form.reset(getDefaultSuitFormValues(initialData));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialData, form]);


  const handleSubmit = (data: SuitFormValues) => {
    const submittedSuit: Suit = {
      ...data,
      id: initialData?.id || crypto.randomUUID(),
      photoUrl: data.photoUrl || "",
      purchaseDate: format(data.purchaseDate, "yyyy-MM-dd"),
      deliveryDate: data.deliveryDate ? format(data.deliveryDate, "yyyy-MM-dd") : undefined,
      returnDate: data.returnDate ? format(data.returnDate, "yyyy-MM-dd") : undefined,
      isReturned: data.isReturned ?? false,
    };
    onSubmit(submittedSuit);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    form.reset(getDefaultSuitFormValues(initialData)); // Reset with potentially new initialData
     if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onCancel();
  };

  const handlePhotoCapture = (dataUri: string) => {
    form.setValue('photoUrl', dataUri, { shouldValidate: true, shouldDirty: true });
    setIsCameraDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input if camera is used
    }
  };

  const handleClearPhoto = () => {
    form.setValue('photoUrl', '', { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showIsReturnedCheckbox =
    (watchCustomerName && watchCustomerName.trim() !== "") &&
    (
      (!initialData?.customerName || watchCustomerName !== initialData.customerName) ||
      (watchCustomerName === initialData?.customerName && initialData?.isReturned === false)
    );


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
              <div className="flex flex-col sm:flex-row gap-2 items-start">
                <FormControl className="flex-grow">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) { // 5MB limit
                          toast({ variant: "destructive", title: "Arquivo Muito Grande", description: "Por favor, selecione uma imagem menor que 5MB." });
                          if(fileInputRef.current) fileInputRef.current.value = "";
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          field.onChange(reader.result as string);
                        };
                        reader.onerror = () => {
                          toast({ variant: "destructive", title: "Erro de Upload", description: "Não foi possível carregar a imagem." });
                        }
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full"
                  />
                </FormControl>
                <Button type="button" variant="outline" onClick={() => setIsCameraDialogOpen(true)} className="w-full sm:w-auto">
                  <Camera className="mr-2 h-4 w-4" /> Tirar Foto
                </Button>
              </div>
              {watchPhotoUrl && (
                <div className="mt-2 flex items-start gap-2">
                  <Image
                    src={watchPhotoUrl}
                    alt="Pré-visualização do terno"
                    width={100}
                    height={125}
                    className="rounded-md object-cover aspect-[3/4] border"
                    data-ai-hint="suit preview"
                    onError={() => {
                        toast({variant: "destructive", title: "Erro de Visualização", description: "Não foi possível exibir a imagem."})
                    }}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={handleClearPhoto} aria-label="Limpar foto">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
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

        <h3 className="text-lg font-medium border-t pt-4 mt-6">Informações do Aluguel</h3>
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
              <FormLabel>Observações do Aluguel</FormLabel>
              <FormControl><Textarea placeholder="Ex: Pedidos especiais, notas sobre condição do terno para este aluguel" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        { showIsReturnedCheckbox && (
            <FormField
                control={form.control}
                name="isReturned"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                        Terno Devolvido?
                    </FormLabel>
                    <FormDescription>
                        Marque esta opção se o terno já foi devolvido pelo cliente.
                    </FormDescription>
                    </div>
                </FormItem>
                )}
            />
        )}


        <h3 className="text-lg font-medium border-t pt-4 mt-6">Informações do Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl><Input placeholder="João Silva" {...field} value={field.value ?? ""} /></FormControl>
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
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    maxLength={15}
                  />
                </FormControl>
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
                <FormControl><Input type="email" placeholder="nome@exemplo.com" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button type="submit">{initialData?.id ? "Salvar Alterações" : "Adicionar Terno"}</Button>
        </div>
      </form>
      <CameraCaptureDialog
        isOpen={isCameraDialogOpen}
        onClose={() => setIsCameraDialogOpen(false)}
        onCapture={handlePhotoCapture}
      />
    </Form>
  );
}

