import { ChangeEvent, useMemo, useState } from "react";
import { SignupPassword as ScreenProvider } from "@auth0/auth0-acul-js";

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

export default function SignupPassword() {
  const screenManager = useMemo(() => new ScreenProvider(), []);
  const [error, setError] = useState<string>("");
  const serverErrors = screenManager.transaction?.errors ?? [];

  const texts = {
    title: screenManager.screen.texts?.title ?? "Set your password",
    description:
      screenManager.screen.texts?.description ??
      "Choose a strong password to finish creating your account.",
    passwordPlaceholder:
      screenManager.screen.texts?.passwordPlaceholder ?? "Enter password",
    confirmPlaceholder:
      screenManager.screen.texts?.confirmPasswordPlaceholder ??
      "Confirm password",
    buttonText: screenManager.screen.texts?.buttonText ?? "Create account",
    footerText:
      screenManager.screen.texts?.footerText ?? "Used a wrong email/phone?",
    footerLinkText: screenManager.screen.texts?.footerLinkText ?? "Go back",
  };

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const passwordInput = e.target.querySelector(
      "input#password"
    ) as HTMLInputElement;
    const confirmInput = e.target.querySelector(
      "input#confirm-password"
    ) as HTMLInputElement;

    // Basic client check; server-side policy enforcement still applies
    if (confirmInput?.value && confirmInput.value !== passwordInput?.value) {
      setError("Passwords do not match.");
      return;
    }

    // ACUL will complete signup and redirect/advance per your tenant configuration
    await screenManager.signup({
      password: passwordInput?.value,
      // If you capture additional fields (e.g., terms), include them here as well
      // termsAccepted: true
    });
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
            <Label htmlFor="password" className="form-label">
              {texts.passwordPlaceholder}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
              className="form-input"
            />
          </div>

          <div className="form-group mt-3">
            <Label htmlFor="confirm-password" className="form-label">
              {texts.confirmPlaceholder}
            </Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="form-input"
            />
          </div>

          {/* Optional: show server-side password policy hints */}
          {/* <Text className="form-text mt-2">
            {screen.screen.passwordPolicyHint ?? ""}
          </Text> */}

          <Button type="submit" className="form-button mt-4">
            {texts.buttonText}
          </Button>

          {(error || serverErrors.length > 0) && (
            <div className="mt-3 text-sm text-red-600">
              {error && <p>{error}</p>}
              {serverErrors.map((er: { code: string; message: string }) => (
                <p key={er.code}>{er.message}</p>
              ))}
            </div>
          )}

          <Text className="form-text mt-6">
            {texts.footerText}
            <Link
              href={screenManager.screen.editLink ?? "#"}
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
