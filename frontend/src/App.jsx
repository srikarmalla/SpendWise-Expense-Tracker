import { useEffect, useState } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Settings, UserRound, Bell, Plus, Search, TrendingUp, TrendingDown, CreditCard, Pencil, Trash2, CalendarDays, RefreshCw,} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,} from "recharts";
import TransactionForm from "./TransactionForm";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/transactions";

const CATEGORY_COLORS = [
  "mediumpurple",
  "cornflowerblue",
  "mediumseagreen",
  "orange",
  "hotpink",
  "teal",
  "goldenrod",
  "slateblue",
  "salmon",
  "steelblue",
];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(date) {
  if (!date) return "—";

  const [year, month, day] = String(date).slice(0, 10).split("-");

  if (!year || !month || !day) return String(date);

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(month) {
  if (!month) return "Selected month";

  const [year, monthNumber] = month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [monthTransactions, setMonthTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("spendwise-profile");
      return savedProfile
        ? JSON.parse(savedProfile)
        : { name: "SpendWise User", email: "", role: "Personal account" };
    } catch {
      return { name: "SpendWise User", email: "", role: "Personal account" };
    }
  });

  async function loadDashboard(month = selectedMonth) {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, allResponse, monthResponse] =
        await Promise.all([
          fetch(`${API_URL}/summary?month=${encodeURIComponent(month)}`),
          fetch(API_URL),
          fetch(`${API_URL}?month=${encodeURIComponent(month)}`),
        ]);

      if (!summaryResponse.ok || !allResponse.ok || !monthResponse.ok) {
        throw new Error("Unable to load your transactions.");
      }

      const [summaryData, allData, monthData] = await Promise.all([
        summaryResponse.json(),
        allResponse.json(),
        monthResponse.json(),
      ]);

      setSummary(summaryData);
      setTransactions(allData);
      setMonthTransactions(monthData);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Check that MongoDB and your backend server are running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    try {
      localStorage.setItem("spendwise-profile", JSON.stringify(profile));
    } catch {
      setError("Your profile could not be saved in this browser.");
    }
  }, [profile]);

  function openAddForm() {
    setEditingTransaction(null);
    setShowForm(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setShowForm(true);
  }

  async function deleteTransaction(transaction) {
    const confirmed = window.confirm(
      `Delete "${transaction.category}" for ${formatCurrency(transaction.amount)}?`
    );

    if (!confirmed) return;

    setDeletingId(transaction._id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${transaction._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete this transaction.");
      }

      await loadDashboard(selectedMonth);
    } catch (err) {
      setError(err.message || "Something went wrong while deleting.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={23} />
          </div>
          <div>
            <h2>SpendWise</h2>
            <span>Expense Tracker</span>
          </div>
        </div>

        <div className="sidebar-section-label">MENU</div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}
            onClick={() => setActivePage("Dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activePage === "Transactions" ? "active" : ""}`}
            onClick={() => setActivePage("Transactions")}
          >
            <ArrowLeftRight size={19} />
            <span>Transactions</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">
              <Wallet size={20} />
            </div>
            <strong>Track your money</strong>
            <p>Keep your income and expenses organized in one place.</p>
          </div>

          <button
            className={`nav-item settings-button ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">{(profile.name.trim()[0] || "S").toUpperCase()}</div>
            <div className="profile-info">
              <strong>{profile.name || "SpendWise User"}</strong>
              <span>{profile.role || "Personal account"}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              title="Notifications"
              onClick={() => window.alert("You are all caught up!")}
            >
              <Bell size={19} />
            </button>
            <div className="topbar-avatar">S</div>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">PERSONAL FINANCE</p>
              <h1>{activePage}</h1>
              <p className="page-description">
                {activePage === "Dashboard"
                  ? "Here is an overview of your finances."
                  : activePage === "Transactions"
                    ? "View and manage your income and expenses."
                    : "Manage your SpendWise profile and preferences."}
              </p>
            </div>

            {activePage !== "Settings" && (
              <div className="heading-actions">
                <label className="month-picker">
                  <CalendarDays size={18} />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    aria-label="Select month"
                  />
                </label>

                <button className="primary-button" onClick={openAddForm}>
                  <Plus size={18} />
                  Add Transaction
                </button>
              </div>
            )}
          </div>

                    {activePage !== "Settings" && (
            <div className="selected-month-label">
              Showing data for <strong>{formatMonth(selectedMonth)}</strong>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={() => loadDashboard(selectedMonth)}>
                Try again
              </button>
            </div>
          )}

          {activePage === "Settings" ? (
            <SettingsPage profile={profile} onSave={setProfile} />
          ) : loading ? (
            <div className="loading-message">Loading your finances...</div>
          ) : activePage === "Dashboard" ? (
            <Dashboard
              summary={summary}
              transactions={transactions}
              monthTransactions={monthTransactions}
              selectedMonth={selectedMonth}
              onAdd={openAddForm}
              onEdit={openEditForm}
              onDelete={deleteTransaction}
              deletingId={deletingId}
            />
          ) : (
            <Transactions
              transactions={monthTransactions}
              selectedMonth={selectedMonth}
              onEdit={openEditForm}
              onDelete={deleteTransaction}
              deletingId={deletingId}
              onRefresh={() => loadDashboard(selectedMonth)}
            />
          )}
        </div>
      </main>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSuccess={() => loadDashboard(selectedMonth)}
        />
      )}
    </div>
  );
}

function SettingsPage({ profile, onSave }) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  function submitForm(event) {
    event.preventDefault();
    const cleanedProfile = {
      name: form.name.trim() || "SpendWise User",
      email: form.email.trim(),
      role: form.role.trim() || "Personal account",
    };
    onSave(cleanedProfile);
    setForm(cleanedProfile);
    setSaved(true);
  }

  return (
    <section className="settings-page">
      <div className="content-card settings-card">
        <div className="settings-card-heading">
          <div className="settings-card-icon"><UserRound size={21} /></div>
          <div>
            <h2>Profile information</h2>
            <p>Update the details shown in your SpendWise workspace.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={submitForm}>
          <div className="form-group">
            <label htmlFor="profile-name">Display name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Enter your name"
              maxLength={60}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-role">Account label</label>
            <input
              id="profile-role"
              name="role"
              type="text"
              value={form.role}
              onChange={updateField}
              placeholder="Personal account"
              maxLength={60}
            />
          </div>

          <div className="settings-form-footer">
            <p className="settings-save-note">
              {saved ? "Profile saved in this browser." : "Your profile is saved in this browser when you save changes."}
            </p>
            <button className="primary-button" type="submit">Save profile</button>
          </div>
        </form>
      </div>

      <div className="content-card settings-card">
        <div className="settings-card-heading">
          <div className="settings-card-icon"><Wallet size={21} /></div>
          <div>
            <h2>Currency</h2>
            <p>Currency used for all transaction totals and charts.</p>
          </div>
        </div>
        <div className="currency-setting">
          <div>
            <strong>Indian Rupee (INR)</strong>
            <p>All amounts are displayed in ₹ Indian Rupees.</p>
          </div>
          <span className="currency-symbol">₹</span>
        </div>
      </div>

      <div className="content-card settings-card">
        <div className="settings-card-heading">
          <div className="settings-card-icon"><Settings size={21} /></div>
          <div>
            <h2>Data and privacy</h2>
            <p>Your transactions are stored in your local MongoDB database. Profile settings are saved in this browser and are not sent to the backend.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dashboard({
  summary,
  transactions,
  monthTransactions,
  selectedMonth,
  onAdd,
  onEdit,
  onDelete,
  deletingId,
}) {
  const monthlyData = buildMonthlyData(transactions, selectedMonth);

  const expensesByCategory = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((result, transaction) => {
      const category = transaction.category || "Other";
      result[category] =
        (result[category] || 0) + Number(transaction.amount || 0);
      return result;
    }, {});

  const categoryData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const recentTransactions = monthTransactions.slice(0, 5);

  return (
    <>
      <section className="summary-grid">
        <SummaryCard
          title="Total Balance"
          amount={summary.balance}
          icon={<Wallet size={20} />}
          variant="balance"
          detail="Income minus expenses"
        />
        <SummaryCard
          title="Total Income"
          amount={summary.income}
          icon={<TrendingUp size={20} />}
          variant="income"
          detail="Income for selected month"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.expense}
          icon={<TrendingDown size={20} />}
          variant="expense"
          detail="Expenses for selected month"
        />
        <SummaryCard
          title="Transactions"
          amount={summary.transactionCount}
          icon={<CreditCard size={20} />}
          variant="count"
          detail="Transactions this month"
          isCount
        />
      </section>

      <section className="charts-grid">
        <div className="content-card monthly-chart-card">
          <div className="card-heading">
            <div>
              <h2>Income vs Expenses</h2>
              <p>Monthly financial activity</p>
            </div>
            <span className="chart-period">Last 6 months</span>
          </div>

          {monthlyData.some((month) => month.income > 0 || month.expense > 0) ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gainsboro" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "slategray", fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "slategray", fontSize: 12 }}
                    tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="mediumseagreen" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="salmon" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="Add transactions to see your monthly chart." />
          )}
        </div>

        <div className="content-card category-chart-card">
          <div className="card-heading">
            <div>
              <h2>Expenses by Category</h2>
              <p>{formatMonth(selectedMonth)}</p>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className="pie-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="category-legend">
                {categoryData.slice(0, 6).map((category, index) => (
                  <div className="category-legend-item" key={category.name}>
                    <span className="legend-dot" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                    <span className="legend-category-name">{category.name}</span>
                    <strong>{formatCurrency(category.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState message="No expenses for this month yet." />
          )}
        </div>
      </section>

      <section className="content-card transactions-card">
        <div className="card-heading">
          <div>
            <h2>Recent Transactions</h2>
            <p>Transactions for {formatMonth(selectedMonth)}</p>
          </div>
          <span className="record-count">{monthTransactions.length} records</span>
        </div>

        {recentTransactions.length > 0 ? (
          <TransactionTable
            transactions={recentTransactions}
            onEdit={onEdit}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ) : (
          <EmptyState message="No transactions found for this month." />
        )}
      </section>

      <div className="dashboard-bottom-action">
        <button className="secondary-button" onClick={onAdd}>
          <Plus size={17} />
          Add a transaction
        </button>
      </div>
    </>
  );
}

function Transactions({
  transactions,
  selectedMonth,
  onEdit,
  onDelete,
  deletingId,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPaymentFilter("all");
    setSortBy("newest");
  }, [selectedMonth]);

  const categories = [
    ...new Set(transactions.map((transaction) => transaction.category).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  const paymentMethods = [
    ...new Set(transactions.map((transaction) => transaction.paymentMethod).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  const filteredTransactions = transactions
    .filter((transaction) => {
      const searchableText = [
        transaction.category,
        transaction.note,
        transaction.paymentMethod,
        transaction.type,
      ].join(" ").toLowerCase();

      return (
        searchableText.includes(searchTerm.toLowerCase()) &&
        (typeFilter === "all" || transaction.type === typeFilter) &&
        (categoryFilter === "all" || transaction.category === categoryFilter) &&
        (paymentFilter === "all" || transaction.paymentMethod === paymentFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "highest") return Number(b.amount) - Number(a.amount);
      if (sortBy === "lowest") return Number(a.amount) - Number(b.amount);
      return 0;
    });

  return (
    <section className="content-card transactions-page-card">
      <div className="transactions-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="transaction-toolbar-actions">
          <select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter transaction type">
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <button className="refresh-button" onClick={onRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="advanced-filters">
        <label className="filter-field">
          <span>Category</span>
          <select className="filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>

        <label className="filter-field">
          <span>Payment method</span>
          <select className="filter-select" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="all">All payment methods</option>
            {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
        </label>

        <label className="filter-field">
          <span>Sort by</span>
          <select className="filter-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest date</option>
            <option value="oldest">Oldest date</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </label>
      </div>

      <div className="transactions-results-heading">
        <div>
          <h2>All Transactions</h2>
          <p>{formatMonth(selectedMonth)}</p>
        </div>
        <span className="record-count">{filteredTransactions.length} records</span>
      </div>

      {filteredTransactions.length > 0 ? (
        <TransactionTable transactions={filteredTransactions} onEdit={onEdit} onDelete={onDelete} deletingId={deletingId} />
      ) : (
        <EmptyState message={transactions.length === 0 ? "No transactions for this month. Add one to get started." : "No transactions match your selected filters."} />
      )}
    </section>
  );
}

function TransactionTable({ transactions, onEdit, onDelete, deletingId }) {
  return (
    <div className="table-scroll">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>
                <div className="transaction-name-cell">
                  <div className={`transaction-type-icon ${transaction.type === "income" ? "income-icon" : "expense-icon"}`}>
                    {transaction.type === "income" ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
                  </div>
                  <div className="transaction-description">
                    <strong>{transaction.category}</strong>
                    <span>{transaction.note || "No description"}</span>
                  </div>
                </div>
              </td>
              <td>{formatDate(transaction.date)}</td>
              <td><span className="payment-method">{transaction.paymentMethod}</span></td>
              <td>
                <strong className={transaction.type === "income" ? "amount-income" : "amount-expense"}>
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </strong>
              </td>
              <td>
                <TransactionActions
                  onEdit={() => onEdit(transaction)}
                  onDelete={() => onDelete(transaction)}
                  deleting={deletingId === transaction._id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionActions({ onEdit, onDelete, deleting }) {
  return (
    <div className="table-actions">
      <button className="action-button edit-button" onClick={onEdit} title="Edit transaction" aria-label="Edit transaction">
        <Pencil size={16} />
      </button>
      <button className="action-button delete-button" onClick={onDelete} title="Delete transaction" aria-label="Delete transaction" disabled={deleting}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function SummaryCard({ title, amount, icon, variant, detail, isCount = false }) {
  return (
    <div className={`summary-card summary-${variant}`}>
      <div className="summary-card-top">
        <span className="summary-title">{title}</span>
        <div className="summary-icon">{icon}</div>
      </div>
      <div className="summary-amount">
        {isCount ? amount || 0 : formatCurrency(amount)}
      </div>
      <div className="summary-detail">{detail}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Wallet size={24} /></div>
      <p>{message}</p>
    </div>
  );
}

function buildMonthlyData(transactions, selectedMonth) {
  const totals = {};

  transactions.forEach((transaction) => {
    const month = String(transaction.date || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) return;

    if (!totals[month]) totals[month] = { month, income: 0, expense: 0 };

    if (transaction.type === "income") {
      totals[month].income += Number(transaction.amount || 0);
    } else if (transaction.type === "expense") {
      totals[month].expense += Number(transaction.amount || 0);
    }
  });

  const [year, monthNumber] = selectedMonth.split("-").map(Number);
  const selectedDate = new Date(year, monthNumber - 1, 1);
  const result = [];

  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    result.push(totals[key] || { month: key, income: 0, expense: 0 });
  }

  return result.map((item) => ({
    ...item,
    month: new Date(Number(item.month.slice(0, 4)), Number(item.month.slice(5, 7)) - 1, 1)
      .toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
  }));
}

export default App;