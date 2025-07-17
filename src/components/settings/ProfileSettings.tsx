
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { User, Shield, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const passwordSchema = z.object({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type MfaFactor = { id: string; status: 'verified' | 'unverified' };

export function ProfileSettings() {
  const { user, updatePassword, listMfaFactors, enrollMfa, challengeAndVerifyMfa, unenrollMfa } = useAuth();
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaData, setMfaData] = useState<{ qrCode: string; secret: string; factorId: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const fetchFactors = async () => {
    const mfaFactors = await listMfaFactors();
    setFactors(mfaFactors?.totp || []);
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const onSubmitPassword = (data: z.infer<typeof passwordSchema>) => {
    updatePassword(data.password).then(() => form.reset());
  };

  const handleEnableMfa = async () => {
    try {
      const data = await enrollMfa();
      if (data) {
        setMfaData({ qrCode: data.totp.qr_code, secret: data.totp.secret, factorId: data.id });
        setIsMfaModalOpen(true);
      }
    } catch (e) { /* error handled by hook */ }
  };
  
  const handleVerifyMfa = async () => {
    if (!mfaData || !mfaCode) return;
    try {
      await challengeAndVerifyMfa(mfaData.factorId, mfaCode);
      setIsMfaModalOpen(false);
      setMfaData(null);
      setMfaCode("");
      fetchFactors(); // Refresh factors list
    } catch(e) { /* error handled by hook */ }
  };
  
  const handleDisableMfa = async (factorId: string) => {
    try {
      await unenrollMfa(factorId);
      fetchFactors(); // Refresh factors list
    } catch(e) { /* error handled by hook */ }
  };

  const isMfaEnabled = factors.some(f => f.status === 'verified');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profil utilisateur</CardTitle>
          <CardDescription>Votre adresse e-mail de connexion.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email || ""} disabled className="mt-1" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••" {...field} className="pr-10" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                          aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••" {...field} className="pr-10" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                          aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Sauvegarder le mot de passe</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Authentification à deux facteurs (2FA)</CardTitle>
          <CardDescription>
            {isMfaEnabled 
              ? "Le 2FA est activé sur votre compte. C'est un bon réflexe sécurité !" 
              : "Protégez votre compte en activant une seconde étape de vérification."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMfaEnabled ? (
            <Button variant="destructive" onClick={() => handleDisableMfa(factors[0].id)}>Désactiver le 2FA</Button>
          ) : (
            <Button onClick={handleEnableMfa}>Activer le 2FA</Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isMfaModalOpen} onOpenChange={setIsMfaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activer l'authentification à deux facteurs</DialogTitle>
            <DialogDescription>
              Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.), puis entrez le code à 6 chiffres pour vérifier.
            </DialogDescription>
          </DialogHeader>
          {mfaData && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-4 bg-white border rounded-lg">
                <img 
                  src={`data:image/svg+xml;base64,${btoa(mfaData.qrCode)}`} 
                  alt="QR Code pour l'authentification à deux facteurs"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">Ou entrez ce code manuellement :</p>
              <code className="p-2 bg-gray-100 rounded-md text-sm">{mfaData.secret}</code>
              <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMfaModalOpen(false)}>Annuler</Button>
            <Button onClick={handleVerifyMfa} disabled={mfaCode.length < 6}>Vérifier et Activer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
