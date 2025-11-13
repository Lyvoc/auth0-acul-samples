import { useState, useMemo } from "react";
import LoginPasswordlessEmailCode from "@auth0/auth0-acul-js/login-passwordless-email-code";

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
  const emailScreen = useMemo(() => new LoginPasswordlessEmailCode(), []);

  const identifier = emailScreen.screen?.data?.username ?? "";
  console.log("[EMAIL-CODE] identifier from screen =", identifier);

  const [email] = useState(identifier);
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      console.log("[EMAIL-CODE] submitCode()", { email, code });
      await emailScreen.submitCode({ email, code });
      setSent(true);
    } catch (err) {
      console.error("[EMAIL-CODE] submitCode() failed", err);
      setError("Invalid or expired code.");
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      console.log("[EMAIL-CODE] resendCode()");
      await emailScreen.resendCode();
    } catch (err) {
      console.error("[EMAIL-CODE] resendCode() failed", err);
      setError("Failed to resend code.");
    }
  };

  return (
    <div className="app-container">
      <form className="card" onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Enter Email Code</CardTitle>
          <CardDescription>
            A one-time code was sent to {identifier}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {error && <Text className="text-red-600">{error}</Text>}
          {sent && (
            <Text className="text-green-600">Logged in successfully!</Text>
          )}

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
              (window.location.href =
                emailScreen.screen?.editIdentifierLink ?? "/u/login")
            }
          >
            ← Back to sign-in options
          </Button>
        </CardContent>
      </form>
    </div>
  );
}
