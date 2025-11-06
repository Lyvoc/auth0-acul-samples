import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { SignupId as screenManager } from "@auth0/auth0-acul-js";

// UI Components (shadcn)
import Button from "../../components/Button";
import { Label } from "../../components/Label";
import { Input } from "../../components/Input";
import { Text } from "../../components/Text";
import { Link } from "../../components/Link";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/Card";

export default function SignupId() {
  const screenManager = useMemo(() => new screenManager(), []);

  const [prefilled, setPrefilled] = useState<string>("");

  // Pre-fill identifier from transaction/untrusted data if available
  useEffect(() => {
    const v =
      (typeof screenManager.screen.data?.username === "string" &&
        screenManager.screen.data.username) ||
      (typeof screenManager.untrustedData.submittedFormData?.username ===
        "string" &&
        screenManager.untrustedData.submittedFormData.username) ||
      "";
    setPrefilled(v);
  }, [screenManager]);

  const texts = {
    title: screenManager.screen.texts?.title ?? "Create your account",
    description:
      screenManager.screen.texts?.description ??
      "Enter your email or phone number to start",
    placeholder:
      screenManager.screen.texts?.emailPlaceholder ?? "you@example.com or +33…",
    buttonText: screenManager.screen.texts?.buttonText ?? "Continue",
    footerText:
      screenManager.screen.texts?.footerText ?? "Already have an account?",
    footerLinkText: screenManager.screen.texts?.footerLinkText ?? "Log in",
  };

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    const input =
      e.currentTarget.querySelector<HTMLInputElement>("#identifier");
    const raw = (input?.value ?? "").trim();
    if (!raw) {
      alert("Please enter an email, phone number, or username.");
      return;
    }

    // Decide which field to send based on the input
    const isEmail = /.+@.+\..+/.test(raw);
    const isPhone = /^\+?\d[\d\s()-]{5,}$/.test(raw);
    const payload: Record<string, string> = isEmail
      ? { email: raw }
      : isPhone
      ? { phone: raw }
      : { username: raw };

    try {
      await screenManager.signup(payload);
      // ACUL will advance the flow (to Signup Password, passkey, etc.)
    } catch (err) {
      const errs =
        (screenManager as any)?.transaction?.getErrors?.() ??
        (screenManager as any)?.transaction?.errors ??
        [];
      const msg = errs[0]?.message || "Signup failed. Please try again.";
      console.error(err);
      alert(msg);
    }
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={onSubmit} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="form-group">
            <Label htmlFor="identifier" className="form-label">
              {texts.placeholder}
            </Label>
            <Input
              id="identifier"
              name="identifier"
              defaultValue={prefilled}
              placeholder="you@example.com"
              autoComplete="username"
              inputMode="email"
              autoFocus
              className="form-input"
            />

            {/* Optional: country picker for phone identifiers */}
            {/* <Button type="button" variant="ghost" onClick={() => screen.pickCountryCode()}>
              Change country code
            </Button> */}
          </div>

          <Button type="submit" className="form-button">
            {texts.buttonText}
          </Button>

          <Text className="form-text mt-6">
            {texts.footerText}
            <Link
              href={screenManager.screen.loginLink ?? "#"}
              className="form-link ml-1"
            >
              {texts.footerLinkText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  );
}
