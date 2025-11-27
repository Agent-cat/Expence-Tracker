import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Budget = () => {
  const [expenses, setExpenses] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState({});
  const [editingBudget, setEditingBudget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

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
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/expenses");
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/auth/profile"
      );
      setMonthlyIncome(response.data.monthlyIncome || 0);

      const defaultBudget = {};
      categories.forEach((cat) => {
        defaultBudget[cat] = (response.data.monthlyIncome || 0) * 0.15;
      });
      setBudgetCategories(defaultBudget);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getCategoryExpenses = (category) => {
    return expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryPercentage = (category) => {
    const spent = getCategoryExpenses(category);
    const budget = budgetCategories[category] || 0;
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  const getTotalBudgeted = () => {
    return Object.values(budgetCategories).reduce(
      (sum, budget) => sum + budget,
      0
    );
  };

  const getTotalSpent = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getRemainingBudget = () => {
    return monthlyIncome - getTotalSpent();
  };

  const handleBudgetChange = (category, value) => {
    setBudgetCategories({
      ...budgetCategories,
      [category]: parseFloat(value) || 0,
    });
  };

  const saveBudget = () => {
    setShowSaveConfirmation(true);
  };

  const confirmSaveBudget = () => {
    setEditingBudget(false);
    setShowSaveConfirmation(false);
  };

  const cancelSaveBudget = () => {
    setShowSaveConfirmation(false);
  };

  const getBudgetStatus = (percentage) => {
    if (percentage >= 100) return { color: "red", text: "Over Budget" };
    if (percentage >= 80) return { color: "orange", text: "Warning" };
    return { color: "green", text: "On Track" };
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black p-4">
      <div className="w-full h-full bg-white shadow-xl rounded-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-black hover:text-gray-600">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-black">Budget Planner</h1>
          </div>
          <button
            onClick={editingBudget ? saveBudget : () => setEditingBudget(true)}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
          >
            {editingBudget ? "Save Budget" : "Edit Budget"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Monthly Income
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ${monthlyIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Total Budget
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              ${getTotalBudgeted().toFixed(2)}
            </p>
          </div>
          <div
            className={`${
              getRemainingBudget() >= 0
                ? "bg-purple-50 border-purple-200"
                : "bg-red-50 border-red-200"
            } p-6 rounded-xl border`}
          >
            <h3
              className={`text-lg font-semibold ${
                getRemainingBudget() >= 0 ? "text-purple-800" : "text-red-800"
              } mb-2`}
            >
              Remaining
            </h3>
            <p
              className={`text-2xl font-bold ${
                getRemainingBudget() >= 0 ? "text-purple-600" : "text-red-600"
              }`}
            >
              ${getRemainingBudget().toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <h3 className="text-xl font-semibold text-black mb-4">
            Category Budgets
          </h3>
          <div className="space-y-4">
            {categories.map((category) => {
              const spent = getCategoryExpenses(category);
              const budget = budgetCategories[category] || 0;
              const percentage = getCategoryPercentage(category);
              const status = getBudgetStatus(percentage);

              return (
                <div key={category} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-black">
                      {category}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status.color === "red"
                          ? "bg-red-100 text-red-800"
                          : status.color === "orange"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {status.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      {editingBudget ? (
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) =>
                            handleBudgetChange(category, e.target.value)
                          }
                          className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                          step="0.01"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-black">
                          ${budget.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Spent</p>
                      <p className="text-lg font-semibold text-black">
                        ${spent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p
                        className={`text-lg font-semibold ${
                          budget - spent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${(budget - spent).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        percentage >= 100
                          ? "bg-red-500"
                          : percentage >= 80
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {percentage.toFixed(1)}% of budget used
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {editingBudget && (
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setEditingBudget(false)}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={saveBudget}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition"
            >
              Save Budget
            </button>
          </div>
        )}

        {/* Save Confirmation Popup */}
        {showSaveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-xl font-bold text-black mb-4">
                Confirm Save Budget
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to save these budget changes? This will
                update your budget allocations for all categories.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={cancelSaveBudget}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSaveBudget}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                >
                  Save Budget
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
