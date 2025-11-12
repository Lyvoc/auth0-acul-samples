import { useMemo, useState, useEffect, ChangeEvent } from "react";
import LoginPasswordlessEmailCode from "@auth0/auth0-acul-js/login-passwordless-email-code";

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
  const emailCode = useMemo(() => new LoginPasswordlessEmailCode(), []);

  // Prefill: prefer the email in the switch intent; else try ACUL screen data
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("acul_switch_prefill");
      if (raw) {
        const { connection, username } = JSON.parse(raw) as {
          connection: "email" | "sms";
          username: string;
        };
        if (connection === "email" && username?.includes("@"))
          setEmail(username);
        sessionStorage.removeItem("acul_switch_prefill"); // clear here (after read)
      }
    } catch {
      // ignore JSON parse errors
    }
    const fromCtx = emailCode?.screen?.data?.username;
    if (typeof fromCtx === "string" && fromCtx.includes("@")) {
      setEmail((v) => v || fromCtx);
    }
  }, [emailCode]);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setResent(false);

    if (!email || !code) {
      setError("Email and code are required.");
      return;
    }

    try {
      await emailCode.submitCode({ email, code });
      setSuccess(true);
    } catch (err) {
      console.error("Code submission error:", err);
      setError("Invalid code or email. Please try again.");
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess(false);
    setResent(false);
    try {
      await emailCode.resendCode();
      setResent(true);
    } catch (err) {
      console.error("Code resend error:", err);
      setError("Failed to resend code. Please try again later.");
    }
  };

  const texts = {
    title: emailCode?.screen?.texts?.title ?? "Check your email",
    description:
      emailCode?.screen?.texts?.description ??
      "Enter the code we sent to your email",
    codePlaceholder:
      emailCode?.screen?.texts?.codePlaceholder ?? "6-digit code",
    buttonText: emailCode?.screen?.texts?.buttonText ?? "Continue",
    resendText: emailCode?.screen?.texts?.resendText ?? "Resend code",
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
            <Label htmlFor="email" className="form-label">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />

            <Button
              type="button"
              className="w-full mt-4"
              onClick={() => {
                const href = emailCode?.screen?.editIdentifierLink;
                if (href) globalThis.location.href = href;
                else history.back();
              }}
            >
              ← Back to sign-in options
            </Button>
          </div>

          <div className="form-group">
            <Label htmlFor="code" className="form-label">
              {texts.codePlaceholder}
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
              Code resent to your email.
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
