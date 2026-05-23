'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api';
import { describeNetworkishFailure } from '@/lib/authMessages';
import { FORM_LIMITS, minimalFormCardClass, minimalInputClass } from '@/lib/formFieldStyles';
import { ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Введите корректный email')
    .max(FORM_LIMITS.authEmail, 'Слишком длинный email'),
  password: z
    .string()
    .min(1, 'Введите пароль')
    .min(6, 'Пароль должен быть не менее 6 символов')
    .max(FORM_LIMITS.authPassword, 'Слишком длинный пароль'),
});

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Имя должно быть не менее 2 символов')
    .max(FORM_LIMITS.authName, 'Слишком длинное имя'),
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .email('Введите корректный email')
    .max(FORM_LIMITS.authEmail, 'Слишком длинный email'),
  password: z
    .string()
    .min(1, 'Придумайте пароль')
    .min(6, 'Пароль должен быть не менее 6 символов')
    .max(FORM_LIMITS.authPassword, 'Слишком длинный пароль'),
  confirmPassword: z.string().max(FORM_LIMITS.authPassword),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, user, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const from = searchParams?.get('from') || '/';

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) { router.replace('/admin'); }
      else { router.replace(from === '/auth' ? '/profile' : from); }
    }
  }, [user, isAdmin, from, router]);

  if (user) {
    return null;
  }

  const onLogin = async (data: LoginFormData) => {
    loginForm.clearErrors(['password', 'email']);
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Redirect happens reactively via Navigate above
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : describeNetworkishFailure(error);
      loginForm.setError('password', { type: 'server', message });
      toast({ title: 'Не удалось войти', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    registerForm.clearErrors(['email', 'password', 'name', 'confirmPassword']);
    setIsLoading(true);
    try {
      await register(data.email, data.password, data.name);
      toast({ title: 'Регистрация прошла успешно', description: `Добро пожаловать, ${data.name}!` });
      router.push('/profile');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : describeNetworkishFailure(error);
      if (error instanceof ApiError && error.status === 409) {
        registerForm.setError('email', { type: 'server', message });
      } else if (error instanceof ApiError && /парол|password|weak/i.test(message)) {
        registerForm.setError('password', { type: 'server', message });
      } else if (error instanceof ApiError && /email|почт|подтверд/i.test(message)) {
        registerForm.setError('email', { type: 'server', message });
      }
      toast({ title: 'Не удалось зарегистрироваться', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться на сайт
        </Link>

        <Card className={minimalFormCardClass}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-serif">Личный кабинет</CardTitle>
            <CardDescription>Войдите или создайте аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-muted-foreground text-sm font-normal">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="example@mail.ru"
                      maxLength={FORM_LIMITS.authEmail}
                      className={minimalInputClass}
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-muted-foreground text-sm font-normal">
                      Пароль
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••"
                      maxLength={FORM_LIMITS.authPassword}
                      autoComplete="current-password"
                      className={minimalInputClass}
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive" role="alert">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full sage-gradient" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="reg-name" className="text-muted-foreground text-sm font-normal">
                      Имя
                    </Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Ваше имя"
                      maxLength={FORM_LIMITS.authName}
                      className={minimalInputClass}
                      {...registerForm.register('name')}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reg-email" className="text-muted-foreground text-sm font-normal">
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="example@mail.ru"
                      maxLength={FORM_LIMITS.authEmail}
                      className={minimalInputClass}
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reg-password" className="text-muted-foreground text-sm font-normal">
                      Пароль
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      maxLength={FORM_LIMITS.authPassword}
                      autoComplete="new-password"
                      className={minimalInputClass}
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reg-confirm" className="text-muted-foreground text-sm font-normal">
                      Повторите пароль
                    </Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••"
                      maxLength={FORM_LIMITS.authPassword}
                      autoComplete="new-password"
                      className={minimalInputClass}
                      {...registerForm.register('confirmPassword')}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full sage-gradient" disabled={isLoading}>
                    {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


