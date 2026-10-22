import { useState } from "react";
import { X } from "lucide-react";

const API_URL = "http://localhost:5000/api/transactions";

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFormDate(date) {
  if (!date) {
    return getToday();
  }

  return String(date).slice(0, 10);
}

function TransactionForm({ transaction, onClose, onSuccess }) {
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : ""
  );
  const [type, setType] = useState(
    transaction ? transaction.type : "expense"
  );
  const [category, setCategory] = useState(
    transaction ? transaction.category : ""
  );
  const [date, setDate] = useState(
    transaction ? getFormDate(transaction.date) : getToday()
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction ? transaction.paymentMethod : "UPI"
  );
  const [note, setNote] = useState(transaction ? transaction.note || "" : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    if (category.trim().length < 2) {
      setError("Category must contain at least 2 characters.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    const transactionData = {
      amount: Number(amount),
      type,
      category: category.trim(),
      date,
      paymentMethod,
      note: note.trim(),
    };

    setSaving(true);

    try {
      const url = transaction
        ? `${API_URL}/${transaction._id}`
        : API_URL;

      const response = await fetch(url, {
        method: transaction ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save transaction.");
      }

      await onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-overlay">
      <section className="transaction-form-panel">
        <div className="form-heading">
          <div>
            <h2>{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
            <p>
              {transaction
                ? "Update your transaction details."
                : "Record your income or expenses."}
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close form"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Transaction Type
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
            />
          </label>

          <label>
            Category
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Food, Salary, Travel..."
              minLength={2}
              required
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Payment Method
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              required
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Note (Optional)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Enter a note"
              maxLength={200}
              rows={3}
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : transaction
                  ? "Update Transaction"
                  : "Save Transaction"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TransactionForm;