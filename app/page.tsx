"use client";

export default function Home() {
  async function pingHandler() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/ping`);
    const data = await response.json();
    console.log(data);
  }

  return (
    <div>
      <h1>Entrostat - OTP Generator</h1>
      <button onClick={pingHandler}>PING</button>
    </div>
  );
}
