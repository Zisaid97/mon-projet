
import { z } from 'zod';
import { sanitizeInput } from './sanitizers';

// Enhanced email validation with additional security checks
export const emailSchema = z.string()
  .email('Email invalide')
  .min(1, 'Email requis')
  .max(254, 'Email trop long')
  .refine((email) => {
    // Additional security: check for suspicious patterns
    const suspiciousPatterns = [/<script/i, /javascript:/i, /data:/i, /vbscript:/i];
    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }, 'Email contient des caractères non autorisés');

// Enhanced password validation with stronger requirements
export const passwordSchema = z.string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial')
  .refine((password) => {
    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{3,}/, // Repeated characters
      /123456|password|qwerty|admin/i, // Common weak passwords
    ];
    return !weakPatterns.some(pattern => pattern.test(password));
  }, 'Le mot de passe est trop faible');

// URL validation with enhanced security
export const urlSchema = z.string().url('URL invalide').refine((url) => {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block potentially dangerous domains
    const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    return !blockedDomains.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}, 'URL non autorisée');

// Numeric validation with enhanced security
export const numericSchema = z.number()
  .min(0, 'La valeur doit être positive')
  .max(999999999, 'La valeur est trop élevée')
  .finite('La valeur doit être un nombre fini');

// Date validation with security checks
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
  .refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const minDate = new Date('2020-01-01');
    const maxDate = new Date(now.getFullYear() + 1, 11, 31);
    return parsed >= minDate && parsed <= maxDate && !isNaN(parsed.getTime());
  }, 'Date invalide ou hors limites');

// Enhanced marketing data validation
export const marketingDataSchema = z.object({
  date: dateSchema,
  spend_usd: numericSchema.max(100000, 'Montant de dépense trop élevé'),
  leads: z.number().int().min(0).max(10000, 'Nombre de leads trop élevé'),
  deliveries: z.number().int().min(0).max(10000, 'Nombre de livraisons trop élevé'),
  margin_per_order: numericSchema.max(10000, 'Marge par commande trop élevée'),
}).strict();

// Enhanced financial data validation
export const financialDataSchema = z.object({
  date: dateSchema,
  exchange_rate: z.number().min(0.1).max(100, 'Taux de change invalide'),
  amount_received_usd: numericSchema.max(1000000, 'Montant trop élevé'),
}).strict();

// Enhanced profit data validation
export const profitDataSchema = z.object({
  date: dateSchema,
  cpd_category: numericSchema.max(1000, 'Catégorie CPD trop élevée'),
  quantity: z.number().int().min(1).max(1000, 'Quantité invalide'),
  product_name: z.string()
    .min(1, 'Le nom du produit est requis')
    .max(100, 'Le nom du produit ne peut pas dépasser 100 caractères')
    .refine((name) => {
      const cleanName = sanitizeInput(name);
      return cleanName.length > 0 && cleanName === name;
    }, 'Le nom du produit contient des caractères non autorisés'),
}).strict();

// Enhanced organization validation
export const organizationSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .refine((name) => {
      const cleanName = sanitizeInput(name);
      return cleanName.length > 0 && cleanName === name;
    }, 'Le nom contient des caractères non autorisés'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .refine((desc) => {
      if (!desc) return true;
      const cleanDesc = sanitizeInput(desc);
      return cleanDesc === desc;
    }, 'La description contient des caractères non autorisés')
    .optional(),
}).strict();
