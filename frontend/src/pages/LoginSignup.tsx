import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { LoginFormInputs } from '@/models/auth';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

const LoginSignup: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LoginFormInputs>();
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        navigate('/');
      } else {
        await signup(data.email, data.password);
        toast({
          title: 'Signup successful',
          description: 'Your account has been created. Please check your email to verify your account.',
        });
        setMode('login');
        reset();
      }
    } catch (err: any) {
      toast({
        title: mode === 'login' ? 'Login failed' : 'Signup failed',
        description: err.message || (mode === 'login' ? 'Invalid email or password' : 'Could not create account'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-muted/40 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { required: 'Email is required' })}
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="text-sm text-destructive">{errors.email.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                {...register('password', { required: 'Password is required' })}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="text-sm text-destructive">{errors.password.message}</span>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Signup')}
            </Button>
          </form>
          <Separator className="my-6" />
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            disabled={isSubmitting}
          >
            {mode === 'login' ? 'Create an account' : 'Back to login'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {mode === 'login'
              ? 'Forgot your password? Contact support.'
              : 'Already have an account? Switch to login.'}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginSignup; 