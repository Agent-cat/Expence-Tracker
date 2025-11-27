import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const Dashboard = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Other",
  ];
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchExpenses();
      fetchUserProfile();
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/expenses");
      setExpenses(response.data || []);

      const total = response.data.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      setTotalExpenses(total);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(
        "http://localhost:8081/api/auth/profile"
      );
      setUser(response.data);
      setMonthlyIncome(response.data.monthlyIncome || 0);
      setSavings((response.data.monthlyIncome || 0) - totalExpenses);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    setSavings(monthlyIncome - totalExpenses);
  }, [monthlyIncome, totalExpenses]);

  const getCategoryData = () => {
    const categoryTotals = {};
    categories.forEach((cat) => (categoryTotals[cat] = 0));

    expenses.forEach((expense) => {
      if (categoryTotals.hasOwnProperty(expense.category)) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals["Other"] += expense.amount;
      }
    });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i >= 0 ? currentYear : currentYear - 1;
      const monthName = new Date(year, month).toLocaleString("default", {
        month: "short",
      });
      monthlyTotals[monthName] = 0;
    }

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      const monthName = expenseDate.toLocaleString("default", {
        month: "short",
      });
      if (monthlyTotals.hasOwnProperty(monthName)) {
        monthlyTotals[monthName] += expense.amount;
      }
    });

    return {
      labels: Object.keys(monthlyTotals).reverse(),
      datasets: [
        {
          label: "Monthly Expenses",
          data: Object.values(monthlyTotals).reverse(),
          backgroundColor: "#36A2EB",
          borderColor: "#36A2EB",
          borderWidth: 1,
        },
      ],
    };
  };

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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              Dashboard
            </h1>
            {user && (
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Welcome, {user.firstName} {user.lastName}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
            <Link
              to="/expenses"
              className="bg-black hover:bg-gray-800 text-white px-3 py-2 sm:px-4 rounded-lg transition text-sm sm:text-base"
            >
              Manage Expenses
            </Link>
            <Link
              to="/budget"
              className="bg-black hover:bg-gray-800 text-white px-3 py-2 sm:px-4 rounded-lg transition text-sm sm:text-base"
            >
              Budget
            </Link>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 rounded-lg transition text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-green-50 p-3 sm:p-6 rounded-xl border border-green-200">
            <h3 className="text-sm sm:text-lg font-semibold text-green-800 mb-2">
              Monthly Income
            </h3>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              ₹{monthlyIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-3 sm:p-6 rounded-xl border border-red-200">
            <h3 className="text-sm sm:text-lg font-semibold text-red-800 mb-2">
              Total Expenses
            </h3>
            <p className="text-lg sm:text-2xl font-bold text-red-600">
              ₹{totalExpenses.toFixed(2)}
            </p>
          </div>
          <div
            className={`${
              savings >= 0
                ? "bg-blue-50 border-blue-200"
                : "bg-orange-50 border-orange-200"
            } p-3 sm:p-6 rounded-xl border`}
          >
            <h3
              className={`text-sm sm:text-lg font-semibold ${
                savings >= 0 ? "text-blue-800" : "text-orange-800"
              } mb-2`}
            >
              {savings >= 0 ? "Savings" : "Overspend"}
            </h3>
            <p
              className={`text-lg sm:text-2xl font-bold ${
                savings >= 0 ? "text-blue-600" : "text-orange-600"
              }`}
            >
              ₹{Math.abs(savings).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-1 overflow-hidden">
          <div className="bg-gray-50 p-3 sm:p-6 rounded-xl flex flex-col lg:col-span-2">
            <h3 className="text-sm sm:text-lg font-semibold text-black mb-2 sm:mb-4">
              Expenses by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="flex items-center justify-center">
                <div className="w-full h-40 sm:h-48">
                  <Pie
                    data={getCategoryData()}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 10,
                            font: {
                              size: 11,
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full h-40 sm:h-48">
                  <Bar
                    data={getCategoryData()}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return "₹" + value;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 sm:p-6 rounded-xl">
            <h3 className="text-sm sm:text-lg font-semibold text-black mb-2 sm:mb-4">
              Monthly Summary
            </h3>
            <div className="space-y-2 sm:space-y-3 overflow-y-auto max-h-48 sm:max-h-56 lg:max-h-64">
              {getMonthlyData().labels.map((label, index) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-black">
                    ₹{getMonthlyData().datasets[0].data[index].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
