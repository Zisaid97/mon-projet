import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Eye, EyeOff, Sparkles, Mail, Lock, User, Shield } from "lucide-react";

export default function Auth() {
  const { user, login, register, hydrated, resendConfirmationEmail, submitMfaChallenge } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [authStep, setAuthStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  if (hydrated && user) {
    navigate("/dashboard");
    return null;
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setShowResend(false);
    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result?.mfaRequired) {
          setAuthStep("mfa");
        }
      } else {
        await register(email, password, {
          first_name: firstName,
          last_name: lastName,
        });
        navigate("/dashboard");
      }
    } catch (e: any) {
      setErr(e.message || "Erreur inconnue");
      if (
        typeof e.message === "string" && (
          e.message.toLowerCase().includes("email not confirmed") ||
          e.message.toLowerCase().includes("email confirmation") ||
          e.message.toLowerCase().includes("courriel non confirmé")
        )
      ) {
        setShowResend(true);
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await submitMfaChallenge(mfaCode);
    } catch (e: any) {
      setErr(e.message || "Erreur inconnue");
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendConfirmationEmail(email);
    } catch (e: any) {
    } finally {
      setResending(false);
    }
  };

  const renderCredentialsForm = () => (
    <div className="w-full max-w-md">
      {/* Logo et titre */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          TrackProfit
        </h1>
        <p className="text-gray-600 font-medium">Marketing Hub</p>
        <p className="text-sm text-gray-500 mt-2">
          {mode === "login" ? "Connectez-vous à votre espace" : "Créez votre compte professionnel"}
        </p>
      </div>

      <form
        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200/50"
        onSubmit={handleCredentialsSubmit}
        autoComplete="off"
      >
        {mode === "register" && (
          <>
            <div className="mb-6">
              <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                Prénom
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div className="mb-6">
              <Label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de famille
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre nom"
                  autoComplete="family-name"
                />
              </div>
            </div>
          </>
        )}
        <div className="mb-6">
          <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Adresse email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="votre@email.com"
              autoComplete="username"
            />
          </div>
        </div>
        <div className="mb-6">
          <Label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Min. 6 caractères"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {err && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="text-red-600 text-sm font-medium">{err}</div>
          </div>
        )}
        
        {showResend && (
          <div className="mb-6 text-center">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Renvoi en cours..." : "Renvoyer l'email de confirmation"}
            </button>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          {mode === "login" ? "Se connecter" : "Créer un compte"}
        </Button>
        
        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <>
              <span className="text-gray-600">Pas encore de compte ?</span>{" "}
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                onClick={() => setMode("register")}
              >
                S'inscrire
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-600">Déjà inscrit ?</span>{" "}
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                onClick={() => setMode("login")}
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );

  const renderMfaForm = () => (
    <div className="w-full max-w-md">
      {/* Logo et titre */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Vérification 2FA
        </h1>
        <p className="text-gray-600 font-medium">Sécurité renforcée</p>
        <p className="text-sm text-gray-500 mt-2">
          Entrez le code de votre application d'authentification
        </p>
      </div>

      <form
        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200/50"
        onSubmit={handleMfaSubmit}
      >
        <div className="mb-8 flex justify-center">
          <InputOTP maxLength={6} value={mfaCode} onChange={(value) => setMfaCode(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg font-bold rounded-xl border-2 border-gray-300 focus:border-indigo-500" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg font-bold rounded-xl border-2 border-gray-300 focus:border-indigo-500" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg font-bold rounded-xl border-2 border-gray-300 focus:border-indigo-500" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg font-bold rounded-xl border-2 border-gray-300 focus:border-indigo-500" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg font-bold rounded-xl border-2 border-gray-300 focus:border-indigo-500" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg font-bold rounded-xl border-2 border-gray-300 focus:border-indigo-500" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {err && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="text-red-600 text-sm font-medium text-center">{err}</div>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
          Vérifier le code
        </Button>
        
        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            onClick={() => setAuthStep('credentials')}
          >
            ← Retour à la connexion
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      {authStep === "credentials" ? renderCredentialsForm() : renderMfaForm()}
    </div>
  );
}
