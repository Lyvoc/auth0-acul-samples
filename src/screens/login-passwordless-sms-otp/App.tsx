import { useState, useMemo } from "react";
import LoginPasswordlessSmsOtp from "@auth0/auth0-acul-js/login-passwordless-sms-otp";

import Button from "../../components/Button";
import { Label } from "../../components/Label";
import { Input } from "../../components/Input";
import { Text } from "../../components/Text";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/Card";

export default function App() {
  const sms = useMemo(() => new LoginPasswordlessSmsOtp(), []);

  const identifier = sms.screen?.data?.username ?? "";
  console.log("[SMS-OTP] identifier from screen =", identifier);

  const [username, setUsername] = useState(identifier);
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log("[SMS-OTP] submitOTP()", { username, otp });

    try {
      await sms.submitOTP({ username, code: otp });
      setSuccess(true);
    } catch (err) {
      console.error("[SMS-OTP] submitOTP failed", err);
      setError("Invalid OTP.");
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess(false);
    try {
      await sms.resendOTP();
    } catch (err) {
      console.error("Code resend error:", err);
      setError("Failed to resend code. Please try again later.");
    }
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={handleSubmit} className="card">
        <CardHeader>
          <CardTitle>Enter SMS Code</CardTitle>
          <CardDescription>We sent a code to your phone number</CardDescription>
        </CardHeader>

        <CardContent>
          <Label htmlFor="username">Phone</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Label htmlFor="otp">One-time code</Label>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            placeholder="123456"
          />

          {error && <Text className="text-red-600">{error}</Text>}
          {success && <Text className="text-green-600">Login successful!</Text>}

          <div className="flex gap-2 mt-4">
            <Button type="submit">Continue</Button>
            <Button type="button" onClick={handleResend}>
              Resend Code
            </Button>
          </div>

          <Button
            type="button"
            className="mt-6"
            onClick={() =>
              (window.location.href = sms.screen?.backLink ?? "/u/login")
            }
          >
            ← Back to sign-in options
          </Button>
        </CardContent>
      </form>
    </div>
  );
}
