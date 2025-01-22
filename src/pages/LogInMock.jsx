import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    console.log({ user });
  }, [user]);

  useEffect(() => {
    console.log({ email, password });
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log(email, password);
    const response = await fetch("http://localhost:3000/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    localStorage.setItem("token", json.token);
    setToken(json.token);
  };

  const fetchUser = async (token) => {
    const response = await fetch("http://localhost:3000/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    console.log({ json });
    setUser(json);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token]);

  return (
    <>
      <h1>Flash Go</h1>
      {!user && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" onBlur={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              onBlur={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleSubmit}>Log In</button>
        </div>
      )}
      {user && (
        <>
          <h2>{user.name}</h2>
          <p>{user.age}</p>
          <p>{user.email}</p>
          <p>{user.rol}</p>
          <button onClick={() => logout()}>Logout</button>
        </>
      )}
    </>
  );
}

export default App;
