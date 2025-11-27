import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Food",
    notes: "",
  });
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Other",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get("http://localhost:8081/api/expenses");
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      setError("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        expenseDate: Date.now(),
      };

      if (editingExpense) {
        await axios.put(
          `http://localhost:8081/api/expenses/${editingExpense.id}`,
          expenseData
        );
        setExpenses(
          expenses.map((exp) =>
            exp.id === editingExpense.id
              ? { ...expenseData, id: editingExpense.id }
              : exp
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:8081/api/expenses",
          expenseData
        );
        setExpenses([response.data, ...expenses]);
      }

      resetForm();
    } catch (error) {
      setError("Failed to save expense");
    }
  };

  const handleEdit = (expense) => {
    setPendingAction(expense);
    setShowEditConfirmation(true);
  };

  const confirmEdit = () => {
    setFormData({
      description: pendingAction.description,
      amount: pendingAction.amount.toString(),
      category: pendingAction.category,
      notes: pendingAction.notes || "",
    });
    setEditingExpense(pendingAction);
    setShowForm(true);
    setShowEditConfirmation(false);
    setPendingAction(null);
  };

  const cancelEdit = () => {
    setShowEditConfirmation(false);
    setPendingAction(null);
  };

  const handleDelete = (id) => {
    setPendingAction(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      await axios.delete(`http://localhost:8081/api/expenses/${pendingAction}`);
      setExpenses(expenses.filter((exp) => exp.id !== pendingAction));
    } catch (error) {
      setError("Failed to delete expense");
    }
    setShowDeleteConfirmation(false);
    setPendingAction(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setPendingAction(null);
  };

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "Food",
      notes: "",
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black p-2 sm:p-4">
      <div className="w-full h-full bg-white shadow-xl rounded-2xl p-3 sm:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/dashboard"
              className="text-black hover:text-gray-600 text-sm sm:text-base"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl sm:text-3xl font-bold text-black">
              Expenses
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-sm sm:text-lg font-semibold text-black">
              Total: ₹{totalExpenses.toFixed(2)}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-black hover:bg-gray-800 text-white px-3 py-2 sm:px-4 rounded-lg transition text-sm sm:text-base w-full sm:w-auto"
            >
              {showForm ? "Cancel" : "Add Expense"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-3 sm:p-6 rounded-xl mb-4 sm:mb-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-4">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                required
                step="0.01"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="notes"
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base"
              >
                {editingExpense ? "Update" : "Add"} Expense
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base"
              >
                Reset
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-auto">
          {expenses.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
              No expenses recorded yet. Add your first expense!
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition gap-3"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-black">
                      {expense.description}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
                        {expense.category}
                      </span>
                      <span>₹{expense.amount.toFixed(2)}</span>
                      <span>
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </span>
                      {expense.notes && (
                        <span className="italic">{expense.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 sm:px-3 sm:py-1 rounded-lg transition text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 sm:px-3 sm:py-1 rounded-lg transition text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Confirmation Popup */}
        {showEditConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-xl font-bold text-black mb-4">
                Confirm Edit Expense
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to edit this expense? You will be able to
                modify all expense details.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit Expense
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-xl font-bold text-black mb-4">
                Confirm Delete Expense
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this expense? This action cannot
                be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Delete Expense
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
