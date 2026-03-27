import React, { useState, useEffect } from 'react';
import { notesAPI } from '@/services/api';
import { StickyNote, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';

const NotePlatform = ({ userId, language }) => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', subject: '', tags: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await notesAPI.getUserNotes(userId);
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    try {
      await notesAPI.createNote({
        user_id: userId,
        ...formData
      });
      setFormData({ title: '', content: '', subject: '', tags: [] });
      setShowForm(false);
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.deleteNote(noteId);
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="note-platform-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <StickyNote className="h-8 w-8 text-yellow-600" />
            <span>Notes Platform</span>
          </h1>
          <p className="text-gray-600 mt-1">Create and organize your study notes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Subject (optional)"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Write your notes here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              rows={8}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateNote}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Create Note
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{note.title}</h3>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {note.subject && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs mb-3">
                  {note.subject}
                </span>
              )}
              <p className="text-gray-600 text-sm line-clamp-4">{note.content}</p>
              {note.ai_summary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">AI Summary:</p>
                  <p className="text-sm text-gray-700">{note.ai_summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <StickyNote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notes yet. Create your first note!</p>
        </div>
      )}
    </div>
  );
};

export default NotePlatform;