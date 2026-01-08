'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StickyNote, Plus, X, Bell, Star, Trash2, Edit, Calendar, Clock } from 'lucide-react';
import type { StaffNote } from '@/types/staff-note';

export default function StaffNotesPage() {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<StaffNote | null>(null);
  const [staffId, setStaffId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'important' | 'reminders'>('all');

  const [formData, setFormData] = useState({
    note_text: '',
    reminder_preset: 'none' as '15min' | '1hour' | '9am' | 'custom' | 'none',
    custom_datetime: '',
    is_important: false,
  });

  useEffect(() => {
    fetchStaffIdAndNotes();
  }, []);

  async function fetchStaffIdAndNotes() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get staff record
      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!staffData) {
        alert('Staff record not found');
        return;
      }

      setStaffId(staffData.id);
      await fetchNotes(staffData.id);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotes(staffId: string) {
    try {
      const { data, error } = await supabase
        .from('staff_notes')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  }

  function calculateReminderDatetime(preset: string, customDatetime?: string): string | null {
    const now = new Date();

    switch (preset) {
      case '15min':
        now.setMinutes(now.getMinutes() + 15);
        return now.toISOString();
      
      case '1hour':
        now.setHours(now.getHours() + 1);
        return now.toISOString();
      
      case '9am':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow.toISOString();
      
      case 'custom':
        return customDatetime ? new Date(customDatetime).toISOString() : null;
      
      default:
        return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.note_text.trim()) {
      alert('Please enter a note');
      return;
    }

    if (formData.reminder_preset === 'custom' && !formData.custom_datetime) {
      alert('Please select a date and time for custom reminder');
      return;
    }

    try {
      const reminderDatetime = calculateReminderDatetime(
        formData.reminder_preset,
        formData.custom_datetime
      );

      const noteData: any = {
        staff_id: staffId,
        note_text: formData.note_text.trim(),
        is_important: formData.is_important,
        reminder_datetime: reminderDatetime,
        reminder_preset: formData.reminder_preset,
      };

      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('staff_notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase
          .from('staff_notes')
          .insert(noteData);

        if (error) throw error;
      }

      // Reset form
      setFormData({
        note_text: '',
        reminder_preset: 'none',
        custom_datetime: '',
        is_important: false,
      });
      setShowForm(false);
      setEditingNote(null);

      // Refresh notes
      await fetchNotes(staffId);

    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('Delete this note? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('staff_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      await fetchNotes(staffId);
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    }
  }

  function handleEdit(note: StaffNote) {
    setEditingNote(note);
    setFormData({
      note_text: note.note_text,
      reminder_preset: note.reminder_preset || 'none',
      custom_datetime: note.reminder_datetime ? note.reminder_datetime.substring(0, 16) : '',
      is_important: note.is_important,
    });
    setShowForm(true);
  }

  function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const filteredNotes = notes.filter(note => {
    if (filter === 'important') return note.is_important;
    if (filter === 'reminders') return note.reminder_datetime && !note.reminder_sent;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-bold text-[#2A2A2A] mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              My Personal Notes
            </h1>
            <p className="text-[#3D3D3D]">Private notes and reminders</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingNote(null);
              setFormData({
                note_text: '',
                reminder_preset: 'none',
                custom_datetime: '',
                is_important: false,
              });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'Cancel' : 'New Note'}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-[#C9A871] text-white'
                : 'bg-white text-[#3D3D3D] hover:bg-gray-50'
            }`}
          >
            All Notes ({notes.length})
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'important'
                ? 'bg-[#C9A871] text-white'
                : 'bg-white text-[#3D3D3D] hover:bg-gray-50'
            }`}
          >
            Important ({notes.filter(n => n.is_important).length})
          </button>
          <button
            onClick={() => setFilter('reminders')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'reminders'
                ? 'bg-[#C9A871] text-white'
                : 'bg-white text-[#3D3D3D] hover:bg-gray-50'
            }`}
          >
            With Reminders ({notes.filter(n => n.reminder_datetime && !n.reminder_sent).length})
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                  Note
                </label>
                <textarea
                  value={formData.note_text}
                  onChange={(e) => setFormData({ ...formData, note_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871] min-h-32"
                  placeholder="e.g., Call supplier about new lash products, Follow up on client inquiry..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_important"
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                  className="w-4 h-4 text-[#C9A871] focus:ring-[#C9A871]"
                />
                <label htmlFor="is_important" className="text-sm font-medium text-[#2A2A2A] flex items-center gap-1">
                  <Star size={16} className="text-[#C9A871]" />
                  Mark as important
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-[#2A2A2A] mb-3">
                  Set Reminder (Optional)
                </p>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: 'none', label: 'No Reminder' },
                      { value: '15min', label: '15 Minutes' },
                      { value: '1hour', label: '1 Hour' },
                      { value: '9am', label: 'Tomorrow 9am' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, reminder_preset: option.value as any })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.reminder_preset === option.value
                            ? 'bg-[#C9A871] text-white'
                            : 'bg-gray-100 text-[#2A2A2A] hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, reminder_preset: 'custom' })}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition ${
                      formData.reminder_preset === 'custom'
                        ? 'bg-[#C9A871] text-white'
                        : 'bg-gray-100 text-[#2A2A2A] hover:bg-gray-200'
                    }`}
                  >
                    Custom Date & Time
                  </button>

                  {formData.reminder_preset === 'custom' && (
                    <input
                      type="datetime-local"
                      value={formData.custom_datetime}
                      onChange={(e) => setFormData({ ...formData, custom_datetime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition font-medium"
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-[#2A2A2A] rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <StickyNote size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-[#3D3D3D] text-lg">No notes yet</p>
            <p className="text-sm text-gray-500 mt-2">Create your first note to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 ${
                  note.is_important ? 'border-l-4 border-[#C9A871]' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-[#3D3D3D]">
                    {new Date(note.created_at).toLocaleDateString('en-AU')}
                  </p>
                  {note.is_important && (
                    <Star size={18} className="text-[#C9A871] fill-[#C9A871]" />
                  )}
                </div>

                <p className="text-[#3D3D3D] mb-4 whitespace-pre-wrap">
                  {note.note_text}
                </p>

                {note.reminder_datetime && !note.reminder_sent && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                    <Bell size={16} className="text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-900 font-medium">
                        Reminder: {formatDateTime(note.reminder_datetime)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(note)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-[#2A2A2A] rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}