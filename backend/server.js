require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const transactionRoutes = require("./routes/transactions");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "SpendWise API is running"
  });
});

async function startServer() {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
