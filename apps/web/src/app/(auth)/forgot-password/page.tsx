'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await api.post('/auth/forgot-password', values, { skipAuth: true });
    setSent(true);
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <div>
            <p className="font-semibold">Revisa tu bandeja de entrada</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hemos enviado un enlace para restablecer tu contraseña.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
        <CardDescription>
          Escribe tu email y recibirás un enlace de recuperación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="tu@clinica.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio de sesión
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
