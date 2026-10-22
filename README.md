# SpendWise — Expense Tracker

SpendWise is a full-stack personal expense tracking application that helps users record income and expenses, organize transactions by category, and understand their spending through summaries and charts.

## Features

- Dashboard with income, expenses, and balance summaries
- Add, edit, and delete transactions
- Categorize income and expenses
- Record transaction dates and payment methods
- Filter and sort transactions
- View monthly financial summaries and charts
- Profile settings for display name, email, and account label
- Persistent transaction storage using MongoDB

## Tech Stack

**Frontend**
- React
- Vite
- CSS
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API

## Project Structure

```text
SpendWise-Expense-Tracker/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB Atlas database
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/SpendWise-Expense-Tracker.git
cd SpendWise-Expense-Tracker
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/spendwise
```

For a cloud database, replace the MongoDB URI with your MongoDB Atlas connection string.

Start the backend using the script configured in `backend/package.json`, for example:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/transactions` | Retrieve transactions |
| GET | `/api/transactions/summary` | Retrieve financial summary |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

Monthly data can be requested using the `month` query parameter in `YYYY-MM` format.

## Database

MongoDB stores transaction records, while Mongoose defines the transaction schema and validation rules.

## Future Enhancements

- Export transactions to CSV
- Budget limits and spending alerts
- User authentication
- Recurring transactions

## Author

**Srikar Malla**

GitHub: https://github.com/srikarmalla

## License

This project was developed as an academic mini project.
