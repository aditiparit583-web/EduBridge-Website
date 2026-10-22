import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/fees";

const initialForm = {
  studentName: "",
  course: "",
  totalAmount: "",
  paidAmount: "",
  paymentDate: "",
  paymentMode: "Cash",
  remarks: "",
};

function getHeaders(json = false) {
  const token = localStorage.getItem("token");

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

function FeeManagement({ onBack }) {
  const [fees, setFees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(initialForm);

  async function fetchFees() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API, {
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      setFees(Array.isArray(data) ? data : data.fees || []);
    } catch (err) {
      setError(err.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFees();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const total = Number(form.totalAmount);
    const paid = Number(form.paidAmount);

    if (
      !form.studentName.trim() ||
      !form.course.trim() ||
      form.totalAmount === "" ||
      form.paidAmount === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      total < 0 ||
      paid < 0 ||
      paid > total
    ) {
      setError("Paid amount cannot be greater than total amount.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            ...form,
            totalAmount: total,
            paidAmount: paid,
          }),
        }
      );

      const data = await readResponse(response);

      setMessage(data.message || "Fee saved successfully.");
      resetForm();

      await fetchFees();
    } catch (err) {
      setError(err.message || "Unable to save fee record");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(fee) {
    setEditingId(fee._id);

    setForm({
      studentName: fee.studentName || "",
      course: fee.course || "",
      totalAmount: String(fee.totalAmount ?? ""),
      paidAmount: String(fee.paidAmount ?? ""),
      paymentDate: fee.paymentDate
        ? String(fee.paymentDate).substring(0, 10)
        : "",
      paymentMode: fee.paymentMode || "Cash",
      remarks: fee.remarks || "",
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this fee record?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await readResponse(response);

      setMessage(data.message || "Fee deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await fetchFees();
    } catch (err) {
      setError(err.message || "Failed to delete fee");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Fees & Payments
            </h1>
            <p className="text-slate-500">
              Manage student fee records and payments
            </p>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white"
            >
              Back to Dashboard
            </button>
          )}
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-slate-800">
              {editingId ? "Edit Fee" : "Add Fee"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="studentName"
                placeholder="Student Name *"
                value={form.studentName}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                name="course"
                placeholder="Course *"
                value={form.course}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                type="number"
                name="totalAmount"
                placeholder="Total Amount *"
                min="0"
                value={form.totalAmount}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                type="number"
                name="paidAmount"
                placeholder="Paid Amount *"
                min="0"
                max={form.totalAmount || undefined}
                value={form.paidAmount}
                onChange={handleChange}
                required
                className="w-full rounded border p-2"
              />

              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                className="w-full rounded border p-2"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
              </select>

              <textarea
                name="remarks"
                placeholder="Remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {loading
                    ? "Please wait..."
                    : editingId
                    ? "Update Fee"
                    : "Add Fee"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Fee Records
              </h2>

              <button
                type="button"
                onClick={fetchFees}
                disabled={loading}
                className="rounded bg-slate-700 px-3 py-2 text-white disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {loading && fees.length === 0 && <p>Loading fee records...</p>}

            {!loading && fees.length === 0 && !error && (
              <p className="text-slate-500">No fee records found.</p>
            )}

            {fees.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="p-3">Student</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Paid</th>
                      <th className="p-3">Due</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee._id} className="border-b">
                        <td className="p-3 font-semibold">{fee.studentName}</td>
                        <td className="p-3">{fee.course}</td>
                        <td className="p-3">₹{fee.totalAmount}</td>
                        <td className="p-3">₹{fee.paidAmount}</td>
                        <td className="p-3">₹{fee.dueAmount}</td>
                        <td className="p-3">{fee.paymentMode}</td>
                        <td className="p-3">
                          <span
                            className={
                              fee.status === "Paid"
                                ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                : fee.status === "Partial"
                                ? "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
                                : "rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                            }
                          >
                            {fee.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(fee)}
                              className="rounded bg-yellow-500 px-3 py-1 text-white"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(fee._id)}
                              className="rounded bg-red-600 px-3 py-1 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeeManagement;