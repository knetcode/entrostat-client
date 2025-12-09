"use client";

import { useState } from "react";

export default function Ping() {
  const [ping, setPing] = useState<string | null>(null);

  async function pingHandler() {
    const response = await fetch("https://localhost:3001/ping");
    const data = await response.json();
    setPing(data);
  }

  return (
    <div>
      <h1>Entrostat - OTP Generator</h1>
      <button onClick={pingHandler}>PING</button>
      {ping && <p>Ping: {JSON.stringify(ping)}</p>}
    </div>
  );
}
