import { useMemo, useState, ChangeEvent } from "react";
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

  if (fallbackHref) {
    globalThis.location.href = fallbackHref;
  } else {
    history.back();
  }
}

export default function App() {
  const emailCode = useMemo(() => new LoginPasswordlessEmailCode(), []);

  const identifier = emailCode.screen?.data?.username ?? "";
  console.log("[EMAIL-CODE] identifier from screen =", identifier);

  const [email, setEmail] = useState(identifier);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);

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
      console.log("[EMAIL-CODE] submitCode", { email, code });
      await emailCode.submitCode({ email, code });
      setSuccess(true);
    } catch (err) {
      console.error("[EMAIL-CODE] submitCode failed", err);
      setError("Invalid code or email. Please try again.");
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess(false);
    setResent(false);
    try {
      console.log("[EMAIL-CODE] resendCode");
      await emailCode.resendCode();
      setResent(true);
    } catch (err) {
      console.error("[EMAIL-CODE] resendCode failed", err);
      setError("Failed to resend code. Please try again later.");
    }
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={handleSubmit} className="card">
        <CardHeader className="card-header">
          <CardTitle>Continue with Email Code</CardTitle>
          <CardDescription>
            Enter the code sent to {identifier || "your email"}.
          </CardDescription>
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
              className="form-input"
              value={email}
              readOnly
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <Label htmlFor="code" className="form-label">
              Code
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
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
              Continue
            </Button>
            <Button type="button" className="flex-1" onClick={handleResend}>
              Resend Code
            </Button>
          </div>

          <Button
            type="button"
            className="mt-6"
            onClick={() => {
              const href = emailCode.screen?.editIdentifierLink ?? undefined;
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
