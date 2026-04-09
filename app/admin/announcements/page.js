'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBullhorn, FaCheck, FaTimes } from 'react-icons/fa';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 0,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/announcements', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load announcements');

      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const body = { ...formData, id: editingId };

      const res = await fetch('/api/admin/announcements', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save announcement');

      await loadAnnouncements();
      setFormData({ title: '', content: '', type: 'info', priority: 0 });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete announcement');

      await loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: announcement.id,
          isActive: !announcement.isActive,
        }),
      });

      if (!res.ok) throw new Error('Failed to update announcement');

      await loadAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      update: 'bg-green-500/20 text-green-400 border-green-500/30',
      event: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[type] || colors.info;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaBullhorn className="text-yellow-400" />
            Announcements Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage platform announcements</p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', content: '', type: 'info', priority: 0 });
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FaPlus /> New Announcement
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                rows="4"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                >
                  <option value="info">Info</option>
                  <option value="update">Update</option>
                  <option value="event">Event</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full bg-[#1e202b] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                {editingId ? 'Update' : 'Create'} Announcement
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-[#2a2c3a] border border-gray-700 rounded-lg p-12 text-center">
            <FaBullhorn className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No announcements yet</p>
            <p className="text-sm text-gray-500 mt-2">Create your first announcement to get started</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-[#2a2c3a] border rounded-lg p-6 transition-all ${
                announcement.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    {!announcement.isActive && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Priority: {announcement.priority} • Created: {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(announcement)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.isActive
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {announcement.isActive ? <FaCheck /> : <FaTimes />}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
