import { useMemo, useState, useEffect, ChangeEvent } from "react";
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

  // Prefill username (phone or email depending on your config)
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("acul_switch_prefill");
      console.debug("[SMS OTP] acul_switch_prefill raw", raw);

      if (raw) {
        const parsed = JSON.parse(raw) as {
          connection: "email" | "sms";
          username: string;
        };
        console.debug("[SMS OTP] parsed switch_prefill", parsed);

        if (
          parsed.connection === "sms" &&
          typeof parsed.username === "string" &&
          parsed.username.trim()
        ) {
          setUsername(parsed.username);
        }
        sessionStorage.removeItem("acul_switch_prefill");
      }
    } catch (err) {
      console.warn("[SMS OTP] error reading switch_prefill", err);
    }

    console.debug(
      "[SMS OTP] screen.data.username",
      smsOtp?.screen?.data?.username
    );
  }, [smsOtp]);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    console.debug("[SMS OTP] submit with", { username, otp });

    if (!username || !otp) {
      setError("Username and OTP are required.");
      return;
    }
    try {
      await smsOtp.submitOTP({ username, code: otp });
      setSuccess(true);
    } catch (err) {
      console.error("OTP submission error:", err);
      setError("Invalid OTP or username. Please try again.");
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess(false);
    setResent(false);
    try {
      await smsOtp.resendOTP();
      setResent(true);
    } catch (err) {
      console.error("Code resend error:", err);
      setError("Failed to resend code. Please try again later.");
    }
  };

  const texts = {
    title: smsOtp?.screen?.texts?.title ?? "Enter the SMS code",
    description:
      smsOtp?.screen?.texts?.description ??
      "We sent a one-time code to your phone",
    codePlaceholder: smsOtp?.screen?.texts?.codePlaceholder ?? "6-digit code",
    buttonText: smsOtp?.screen?.texts?.buttonText ?? "Continue",
    resendText: smsOtp?.screen?.texts?.resendText ?? "Resend OTP",
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={handleSubmit} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="form-group">
            <Label htmlFor="username" className="form-label">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="+15551234567"
            />

            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                const href = smsOtp?.screen?.backLink;
                if (href) globalThis.location.href = href;
                else history.back();
              }}
            >
              ← Back to sign-in options
            </Button>
          </div>

          <div className="form-group">
            <Label htmlFor="otp" className="form-label">
              {texts.codePlaceholder}
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
          {resent && (
            <Text className="form-text mt-2 text-blue-600">
              Code resent to your phone.
            </Text>
          )}

          <div className="mt-4 flex gap-2">
            <Button type="submit" className="flex-1">
              {texts.buttonText}
            </Button>
            <Button type="button" className="flex-1" onClick={handleResend}>
              {texts.resendText}
            </Button>
          </div>
        </CardContent>
      </form>
    </div>
  );
}
