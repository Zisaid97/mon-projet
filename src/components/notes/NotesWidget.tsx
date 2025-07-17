
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Notebook, Edit3, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Note = Tables<'user_notes'>;

interface NotesWidgetProps {
  pageType: 'marketing' | 'profits';
}

export function NotesWidget({ pageType }: NotesWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Charger les notes
  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('page_type', pageType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  };

  // Sauvegarder une nouvelle note
  const saveNote = async () => {
    if (!user || !newNoteContent.trim()) return;

    try {
      const { error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          content: newNoteContent.trim(),
          page_type: pageType
        });

      if (error) throw error;

      setNewNoteContent('');
      setIsEditing(false);
      await loadNotes();
      
      toast({
        title: "Note sauvegardée ✅",
        description: "Votre note a été ajoutée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la note",
        variant: "destructive",
      });
    }
  };

  // Modifier une note
  const updateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    try {
      const { error } = await supabase
        .from('user_notes')
        .update({ 
          content: editingContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (error) throw error;

      setEditingNoteId(null);
      setEditingContent('');
      await loadNotes();
      
      toast({
        title: "Note modifiée ✅",
        description: "Vos modifications ont été sauvegardées",
      });
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la note",
        variant: "destructive",
      });
    }
  };

  // Supprimer une note
  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      await loadNotes();
      
      toast({
        title: "Note supprimée ✅",
        description: "La note a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  // Charger les notes au montage
  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen, user]);

  if (!user) return null;

  return (
    <>
      {/* Icône flottante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="sm"
        >
          <Notebook className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Widget des notes */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96">
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Notebook className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">
                    📝 Notes {pageType === 'marketing' ? 'Marketing' : 'Profits'}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Formulaire de nouvelle note */}
              {isEditing ? (
                <div className="space-y-3 mb-4">
                  <Textarea
                    placeholder="Écrivez votre note ici..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveNote} size="sm" className="flex-1">
                      <Save className="h-4 w-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setNewNoteContent('');
                      }}
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline" 
                  className="w-full mb-4"
                  size="sm"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Nouvelle note
                </Button>
              )}

              {/* Liste des notes */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune note pour le moment
                  </p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => updateNote(note.id)}
                              size="sm"
                              className="flex-1"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Sauvegarder
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setEditingNoteId(null);
                                setEditingContent('');
                              }}
                              size="sm"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(note.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingContent(note.content);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNote(note.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
