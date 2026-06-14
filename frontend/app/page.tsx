"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type FormData = Omit<Customer, "id">;

const emptyForm: FormData = { name: "", email: "", phone: "" };

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/customers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError("Could not connect to the backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Open modal for add
  const openAdd = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open modal for edit
  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({ name: c.name, email: c.email, phone: c.phone });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  };

  // Submit add or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let res: Response;
      if (editingCustomer) {
        res = await fetch(`${API_BASE}/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`${API_BASE}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCustomers();
      closeModal();
      showToast(editingCustomer ? "Customer updated." : "Customer added.");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete customer
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCustomers();
      setDeletingId(null);
      showToast("Customer deleted.");
    } catch {
      showToast("Delete failed. Please try again.", "error");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Ashgrove Renewable</h1>
            <p className="text-sm text-slate-500 mt-0.5">Customer Management</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Customer
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-500 text-sm">Loading customers…</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-700 text-sm">
            <strong>Connection error:</strong> {error}
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">👥</div>
            <h2 className="text-slate-700 font-medium mb-1">No customers yet</h2>
            <p className="text-slate-400 text-sm mb-5">Add your first customer to get started.</p>
            <button
              onClick={openAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add Customer
            </button>
          </div>
        )}

        {!loading && !error && customers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Name</span>
              <span>Email</span>
              <span>Phone</span>
              <span></span>
            </div>
            {/* Rows */}
            {customers.map((c, i) => (
              <div
                key={c.id}
                className={`grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-6 py-4 items-center ${
                  i < customers.length - 1 ? "border-b border-slate-100" : ""
                } hover:bg-slate-50 transition-colors`}
              >
                <span className="text-sm font-medium text-slate-900">{c.name}</span>
                <span className="text-sm text-slate-600">{c.email}</span>
                <span className="text-sm text-slate-600">{c.phone}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(c.id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
              {customers.length} customer{customers.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+353 1 234 5678"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {submitting ? "Saving…" : editingCustomer ? "Save Changes" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete customer?</h2>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}
