import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const [count, setCount] = useState(0)
  const [message, setMessage] = useState("");

  async function fetchWelcomeMessage() {
    try {
      const res = await fetch("https://localhost:44338/api/app/customer/welcome-message");
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      // Decide whether the API returns text or JSON
      const data = await res.text(); // use .json() if it's JSON
      setMessage(data);
    } catch (err) {
      console.error(err);
    }
  }


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
        <div>
          <h1>React + ABP Test</h1>
          <button onClick={fetchWelcomeMessage}>Get Welcome Message</button>
          {message && <p>Message: {message}</p>}
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
