import React, { useEffect, useState } from "react";

function Dashboard({ user }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<{
    description: string;
    amount: number;
    creationTime: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [batchSize] = useState(20);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [xmlResponse, setXmlResponse] = useState<string>("");

  const sessionId = sessionStorage.getItem("sessionId") || "";

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(
          "https://cors-anywhere.herokuapp.com/https://dev.tellerpoint.hextremelabs.com/Tellerpoint/rpc/merchant/external/wallet/balance",
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              sessionId: sessionId,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch balance");

        const data = await response.json();
        setBalance(data.entity?.ledgerBalance ?? 0);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      }
    };

    fetchBalance();
  }, [sessionId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const requestUrl = "https://cors-anywhere.herokuapp.com/https://dev.tellerpoint.hextremelabs.com/Tellerpoint/rpc/merchant/external/history";

      const headers: Record<string, string> = {
        "content-type": "application/json",
        sessionId: sessionId,
        start: startDate.replace("T", " ") + ":00",
        end: endDate.replace("T", " ") + ":59",
        currentPage: currentPage.toString(),
        batchSize: batchSize.toString(),
      };

      console.log("Sending transaction history request:", { url: requestUrl, headers });

      const response = await fetch(requestUrl, { method: "POST", headers, body: "" });

      console.log("Response received from transactions API:", response);

      const textResponse = await response.text();
      if (textResponse.startsWith("<?xml")) {
        setXmlResponse(textResponse);
      } else {
        const data = JSON.parse(textResponse);
        if (Array.isArray(data.entity)) {
          setTransactions(
            data.entity.map((t) => ({
              description: t.summary ?? "No description",
              amount: t.amount ?? 0,
              creationTime: t.creationTime ?? "Unknown time",
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email || "Guest"}</p>
      <h3>Wallet Balance: {balance !== null ? `₦${balance}` : "Loading..."}</h3>

      <h3>Transaction History</h3>
      <div className="date-inputs">
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={fetchTransactions} disabled={loading}>
          {loading ? "Loading..." : "View Transactions"}
        </button>
      </div>

      {xmlResponse ? (
        <div className="xml-response">
          <h4>XML Response:</h4>
          <pre>{xmlResponse}</pre>
        </div>
      ) : loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>
              {transaction.description} - ₦{transaction.amount} - {transaction.creationTime}
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions found.</p>
      )}

      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button onClick={() => setCurrentPage((prev) => prev + 1)}>Next</button>
      </div>
    </div>
  );
}

export default Dashboard;
