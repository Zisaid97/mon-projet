-- Créer une table d'archive pour les mots-clés supprimés
CREATE TABLE public.product_keywords_archive (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    original_keyword_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    keyword TEXT NOT NULL,
    note TEXT,
    user_id UUID NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deletion_reason TEXT NOT NULL DEFAULT 'manual_deletion',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Activer RLS sur la table d'archive
ALTER TABLE public.product_keywords_archive ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour permettre aux utilisateurs de voir leurs propres archives
CREATE POLICY "Users can view their own keyword archives" 
ON public.product_keywords_archive 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique RLS pour permettre l'insertion d'archives
CREATE POLICY "System can create keyword archives" 
ON public.product_keywords_archive 
FOR INSERT 
WITH CHECK (true);

-- Fonction pour archiver automatiquement les mots-clés avant suppression
CREATE OR REPLACE FUNCTION public.archive_product_keywords_before_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Archiver le mot-clé avec les informations du produit
    INSERT INTO public.product_keywords_archive (
        original_keyword_id,
        product_id,
        product_name,
        keyword,
        note,
        user_id,
        deletion_reason,
        created_at,
        updated_at
    )
    SELECT 
        OLD.id,
        OLD.product_id,
        COALESCE(p.name, 'Produit supprimé'),
        OLD.keyword,
        OLD.note,
        OLD.user_id,
        CASE 
            WHEN TG_TAG = 'product_deleted' THEN 'product_deletion'
            ELSE 'manual_deletion'
        END,
        OLD.created_at,
        OLD.updated_at
    FROM public.products p
    WHERE p.id = OLD.product_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour archiver avant suppression manuelle de mots-clés
CREATE TRIGGER archive_keywords_before_manual_delete
    BEFORE DELETE ON public.product_keywords
    FOR EACH ROW
    EXECUTE FUNCTION public.archive_product_keywords_before_delete();

-- Fonction pour archiver les mots-clés quand un produit est supprimé
CREATE OR REPLACE FUNCTION public.archive_keywords_on_product_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Archiver tous les mots-clés du produit supprimé
    INSERT INTO public.product_keywords_archive (
        original_keyword_id,
        product_id,
        product_name,
        keyword,
        note,
        user_id,
        deletion_reason,
        created_at,
        updated_at
    )
    SELECT 
        pk.id,
        pk.product_id,
        OLD.name,
        pk.keyword,
        pk.note,
        pk.user_id,
        'product_deletion',
        pk.created_at,
        pk.updated_at
    FROM public.product_keywords pk
    WHERE pk.product_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour archiver les mots-clés avant suppression de produit
CREATE TRIGGER archive_keywords_before_product_delete
    BEFORE DELETE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.archive_keywords_on_product_delete();

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_product_keywords_archive_user_id ON public.product_keywords_archive(user_id);
CREATE INDEX idx_product_keywords_archive_product_id ON public.product_keywords_archive(product_id);
CREATE INDEX idx_product_keywords_archive_deleted_at ON public.product_keywords_archive(deleted_at);