import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  setStatusFilter,
  setSearchQuery,
} from '../contactMessagesSlice';
import {
  Mail,
  Phone,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';

const STATUS_BADGES = {
  unread: 'bg-rose-100 text-rose-700 border-rose-200',
  read: 'bg-blue-100 text-blue-700 border-blue-200',
  replied: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ContactMessagesPage() {
  const dispatch = useDispatch();
  const { messages, total, loading, error, statusFilter, searchQuery } = useSelector(
    (state) => state.contactMessages
  );

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalStatus, setModalStatus] = useState('read');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchContactMessages({ status: statusFilter, search: searchQuery }));
  }, [dispatch, statusFilter, searchQuery]);

  const handleOpenDetailModal = (msg) => {
    setSelectedMessage(msg);
    setModalNotes(msg.adminNotes || '');
    setModalStatus(msg.status === 'unread' ? 'read' : msg.status);

    // If it was unread, automatically update to read
    if (msg.status === 'unread') {
      dispatch(updateMessageStatus({ id: msg._id, status: 'read' }));
    }
  };

  const handleSaveModal = () => {
    if (!selectedMessage) return;
    dispatch(
      updateMessageStatus({
        id: selectedMessage._id,
        status: modalStatus,
        adminNotes: modalNotes,
      })
    );
    setSelectedMessage(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      dispatch(deleteContactMessage(deleteId));
      setDeleteId(null);
    }
  };

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const resolvedCount = messages.filter((m) => m.status === 'resolved').length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Customer Contact Messages</h1>
              <p className="text-xs text-slate-500">Manage inquiries, support tickets, and customer queries</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchContactMessages({ status: statusFilter, search: searchQuery }))}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Messages</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
          </div>
          <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unread Inquiries</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{unreadCount}</p>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center font-bold">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Tickets</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['all', 'unread', 'read', 'replied', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => dispatch(setStatusFilter(st))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by name, email, query..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading messages...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 text-xs font-semibold">{error}</div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Messages Found</p>
            <p className="text-xs text-slate-400 mt-1">There are no customer inquiries matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>
                        <p className="font-bold text-slate-900">{msg.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-400" /> {msg.email}
                        </p>
                        {msg.phone && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" /> {msg.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {msg.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600 leading-relaxed font-medium">{msg.message}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                          STATUS_BADGES[msg.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetailModal(msg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View / Reply
                      </button>
                      <button
                        onClick={() => setDeleteId(msg._id)}
                        className="inline-flex items-center p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Detail & Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Message Details</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subject</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedMessage.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="font-medium text-slate-700 mt-0.5">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                  <p className="font-medium text-slate-700 mt-0.5">{selectedMessage.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer Message</p>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-slate-800 font-medium leading-relaxed max-h-48 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Update Status</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none focus:border-slate-400"
                  >
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                    <option value="unread">Unread</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quick Action</label>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg transition"
                  >
                    <Send className="h-3.5 w-3.5" /> Email Customer
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Admin Internal Notes / Resolution</label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Record resolution notes, internal remarks, or call status..."
                  className="w-full bg-white border border-slate-200 px-3 py-2 text-xs font-medium rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-lg transition"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Message?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this customer inquiry? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
