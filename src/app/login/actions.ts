
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// WARNING: Hardcoding credentials is not secure for production environments.
// Consider using environment variables or a proper authentication provider.
const ADMIN_USERNAME = "Riccoterno";
const ADMIN_PASSWORD = "Confioemvoce";

interface LoginState {
  message: string | null;
  success: boolean;
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { message: 'Usuário e senha são obrigatórios.', success: false };
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    cookies().set('auth_token', 'authenticated_user_placeholder_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    });
    // The redirect will be caught by Next.js and interrupt the rendering flow.
    // No explicit return needed here for the success case if redirecting.
    redirect('/');
  }

  return { message: 'Usuário ou senha inválidos.', success: false };
}

export async function logout() {
  cookies().delete('auth_token', { path: '/' });
  redirect('/login');
}
