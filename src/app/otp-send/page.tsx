"use client";

import { useOtpSend } from "@/src/hooks/use-otp-send";

export default function SendOtpPage() {
  const { mutate, isPending, error, data } = useOtpSend();

  return (
    <div>
      <h1>Send OTP Page</h1>
      <button onClick={() => mutate({ email: "kyle@knetcode.com" })}>Send OTP</button>
      {error && <p>{error.message}</p>}
      {isPending && <p>Sending OTP...</p>}
      {data?.message && <p>{data.message}</p>}
    </div>
  );
}
