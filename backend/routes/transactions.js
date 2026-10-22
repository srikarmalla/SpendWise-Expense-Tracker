const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {};

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          message: "Month must use YYYY-MM format"
        });
      }

      const [year, monthNumber] = month.split("-").map(Number);

      if (monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({
          message: "Invalid month"
        });
      }

      const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
      const endDate = new Date(Date.UTC(year, monthNumber, 1));

      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions"
    });
  }
});

// GET monthly summary using MongoDB aggregation
router.get("/summary", async (req, res) => {
  try {
    const { month } = req.query;
    const match = {};

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          message: "Month must use YYYY-MM format"
        });
      }

      const [year, monthNumber] = month.split("-").map(Number);

      if (monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({
          message: "Invalid month"
        });
      }

      match.date = {
        $gte: new Date(Date.UTC(year, monthNumber - 1, 1)),
        $lt: new Date(Date.UTC(year, monthNumber, 1))
      };
    }

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      transactionCount: 0
    };

    for (const item of summary) {
      result[item._id] = item.total;
      result.transactionCount += item.count;
    }

    result.balance = result.income - result.expense;

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to calculate summary"
    });
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid transaction data",
        errors: error.errors
          ? Object.values(error.errors).map((item) => item.message)
          : [error.message]
      });
    }

    res.status(500).json({
      message: "Failed to create transaction"
    });
  }
});

// PUT update an existing transaction
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json(transaction);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid transaction data"
      });
    }

    res.status(500).json({
      message: "Failed to update transaction"
    });
  }
});

// DELETE a transaction
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    const transaction = await Transaction.findByIdAndDelete(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction"
    });
  }
});

module.exports = router;
