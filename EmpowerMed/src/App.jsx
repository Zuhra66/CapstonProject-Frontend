import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

const API_URL = "http://localhost:5000";

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null)
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/endpoint`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error("Error fetching data:", err));
  }, [])

 useEffect(() => {
    fetch(`${API_URL}/csrf-token`, { credentials: 'include' })
      .then(res => res.json())
      .then(tokenData => {
        setCsrfToken(tokenData.csrfToken);
        console.log("CSRF token:", tokenData.csrfToken);
      })
      .catch(err => console.error("Error getting CSRF token:", err));
  }, []);
 const sendSecureData = () => {
    fetch(`${API_URL}/secure`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ message: "This is secure!" })
    })
      .then(res => res.json())
      .then(response => console.log("Response:", response))
      .catch(err => console.error("Error posting data:", err));
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        <p>CSRF Token: {csrfToken ? "Loaded" : "Loading..."}</p>
        <p>Data from backend: {data ? JSON.stringify(data) : "Loading..."}</p>
      <button onClick={sendSecureData}>Send Secure Data</button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
