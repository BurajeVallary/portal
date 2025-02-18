import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const getIPAddress = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;  // Returns the public IP address
    } catch (error) {
      console.error("Error fetching IP address:", error);
      alert("Could not fetch IP address. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Ensure environment variables are accessed using import.meta.env
    const apiKey = import.meta.env.VITE_API_KEY;
    const apiSecret = import.meta.env.VITE_API_SECRET;

    // Check if the variables are loaded correctly
    if (!apiKey || !apiSecret) {
      console.error("API Key or API Secret is missing in .env file");
      return;
    }

    const ipAddress = await getIPAddress();  // Get the machine's IP address dynamically

    if (!ipAddress) {
      return;  // Stop the login process if IP address is not fetched
    }

    const requestBody = {
      apiKey: apiKey, // Accessing API key from .env
      apiSecret: apiSecret, // Accessing API secret from .env
      extraData: {
        ipAddress: ipAddress,  // Use the fetched IP address
      },
    };

    try {
      // API request to authenticate and retrieve sessionId using CORS proxy
      const response = await fetch(
        "https://cors-anywhere.herokuapp.com/https://dev.tellerpoint.hextremelabs.com/Tellerpoint/rpc/merchant/external/authenticate",
        {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(requestBody),  // Sending the request body
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Check if the sessionId is inside the entity object
        if (data && data.entity && data.entity.sessionId) {
          const sessionId = data.entity.sessionId;
          sessionStorage.setItem("sessionId", sessionId); // Store sessionId in sessionStorage

          // Mock user data (you can adjust as needed)
          const userData = { email, role: "admin" };
          setUser(userData);

          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          console.error("Session ID is missing in the response:", data);
          alert("Login failed: Session ID is missing.");
        }
      } else {
        const errorData = await response.json();
        console.error("Authentication failed. Response:", errorData);
        alert("Authentication failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
