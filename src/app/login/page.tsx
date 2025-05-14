
'use client';

import React, { useEffect } from 'react';
import { useActionState } from 'react'; // Changed from react-dom
import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/AppLogo';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, User } from 'lucide-react';

const initialState: { message: string | null; success: boolean } = {
  message: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState); // Changed from useFormState
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AppLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta!</CardTitle>
          <CardDescription>Digite suas credenciais para acessar o SuitUp Aluguel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Riccoterno"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            {state?.message && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SuitUp Aluguel. Todos os direitos reservados.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
