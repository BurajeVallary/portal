import React, { useEffect, useState } from "react";

function Dashboard({ user }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<{ description: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(
          "https://dev.tellerpoint.hextremelabs.com/Tellerpoint/rpc/merchant/external/wallet/balance"
        );
        if (!response.ok) throw new Error("Failed to fetch balance");
        const data = await response.json();
        console.log("Balance Response:", data);
        setBalance(data.entity?.ledgerBalance ?? 0); // Ensure default value
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          "https://dev.tellerpoint.hextremelabs.com/Tellerpoint/rpc/merchant/external/history"
        );
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        console.log("Transactions Response:", data);

        // Ensure data.transactions is an array and has the correct structure
        if (Array.isArray(data.transactions)) {
          setTransactions(
            data.transactions.map((t) => ({
              description: t.description ?? "No description",
              amount: t.amount ?? 0,
            }))
          );
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    fetchTransactions();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email || "Guest"}</p>
      <h3>Balance: {balance !== null ? `$${balance}` : "Loading..."}</h3>
      <h3>Recent Transactions</h3>
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>
              {transaction.description} - ${transaction.amount}
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}

export default Dashboard;
