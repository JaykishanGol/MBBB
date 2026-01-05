'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Error Signing In', description: error.message });
    } else {
      toast({ title: 'Signed In', description: "You've successfully signed in." });
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Error Signing Up', description: error.message });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast({ variant: 'destructive', title: 'Error Signing Up', description: "A user with this email already exists."});
    }
    else {
      toast({ title: 'Success!', description: 'Please check your email to confirm your account.' });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div>
                    <Label htmlFor="email-in">Email address</Label>
                    <Input id="email-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="password-in">Password</Label>
                    <Input id="password-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sign-up">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create a new account to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div>
                    <Label htmlFor="email-up">Email address</Label>
                    <Input id="email-up" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="password-up">Password</Label>
                    <Input id="password-up" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
