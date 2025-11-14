import { useMemo, useState, ChangeEvent } from "react";
import LoginPasswordlessSmsOtp from "@auth0/auth0-acul-js/login-passwordless-sms-otp";

// UI Components
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
  const smsOtp = useMemo(() => new LoginPasswordlessSmsOtp(), []);

  const identifier = smsOtp.screen?.data?.username ?? "";
  console.log("[SMS-OTP] identifier from screen =", identifier);

  const [username, setUsername] = useState(identifier);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function goBackToLoginId(fallbackHref?: string) {
    try {
      const url = new URL(globalThis.location.href);
      const state = url.searchParams.get("state");

      if (state) {
        const target = `${
          url.origin
        }/u/login/identifier?state=${encodeURIComponent(state)}`;
        console.log("[BACK] Redirecting to login-id", target);
        globalThis.location.href = target;
        return;
      }

      console.log("[BACK] No state found in URL, using fallback/backLink");
    } catch (e) {
      console.warn("[BACK] Failed to parse URL, using fallback/backLink", e);
    }

    // Fallback: use backLink if provided, else history.back()
    if (fallbackHref) {
      globalThis.location.href = fallbackHref;
    } else {
      history.back();
    }
  }

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!username || !otp) {
      setError("Phone and OTP are required.");
      return;
    }

    try {
      console.log("[SMS-OTP] submitOTP", { username, otp });
      await smsOtp.submitOTP({ username, code: otp });
      setSuccess(true);
    } catch (err) {
      console.error("[SMS-OTP] submitOTP failed", err);
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess(false);
    try {
      console.log("[SMS-OTP] startResend");
      await smsOtp.resendOTP();
    } catch (err) {
      console.error("[SMS-OTP] startResend failed", err);
      setError("Failed to resend OTP. Please try again later.");
    }
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={handleSubmit} className="card">
        <CardHeader className="card-header">
          <CardTitle>Continue with SMS OTP</CardTitle>
          <CardDescription>
            Enter the code we sent to your phone.
          </CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="form-group">
            <Label htmlFor="username" className="form-label">
              Phone
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              readOnly
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="+33663XXXXXX"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="otp" className="form-label">
              One-time code
            </Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="123456"
            />
          </div>

          {error && (
            <Text className="form-text mt-2 text-red-600">{error}</Text>
          )}
          {success && (
            <Text className="form-text mt-2 text-green-600">
              Login successful!
            </Text>
          )}

          <div className="mt-4 flex gap-2">
            <Button type="submit" className="flex-1">
              Continue
            </Button>
            <Button type="button" className="flex-1" onClick={handleResend}>
              Resend Code
            </Button>
          </div>

          <Button
            type="button"
            className="mt-6"
            onClick={(e) => {
              e.preventDefault();
              const href = smsOtp.screen?.backLink ?? undefined;
              goBackToLoginId(href);
            }}
          >
            ← Back to sign-in options
          </Button>
        </CardContent>
      </form>
    </div>
  );
}
