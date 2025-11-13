import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { LoginPassword as ScreenProvider } from "@auth0/auth0-acul-js";

// UI Components
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

function submitForm(formValues: Record<string, string>) {
  console.log("[LOGIN-PASSWORD] submitForm", formValues);

  const form = document.createElement("form");
  form.method = "POST";
  form.style.display = "none";

  for (const [key, value] of Object.entries(formValues)) {
    const input = document.createElement("input");
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function App() {
  const screenProvider = useMemo(() => new ScreenProvider(), []);
  const [autoSwitching, setAutoSwitching] = useState(false);

  const identifier = screenProvider.screen.data?.username ?? "";
  console.log("[LOGIN-PASSWORD] identifier from screen =", identifier);

  const texts = {
    title: screenProvider.screen.texts?.title ?? "Enter Your Password",
    description:
      screenProvider.screen.texts?.description ??
      "Enter your password to continue",
    passwordPlaceholder:
      screenProvider.screen.texts?.passwordPlaceholder ?? "Password",
    buttonText: screenProvider.screen.texts?.buttonText ?? "Continue",
    forgotPasswordText:
      screenProvider.screen.texts?.forgotPasswordText ??
      "Forgot your Password?",
    editEmailText:
      screenProvider.screen.texts?.editEmailText ?? "Edit identifier",
    emailPlaceholder:
      screenProvider.screen.texts?.emailPlaceholder ?? "Email or phone",
  };

  // Auto-switch to passwordless if requested
  useEffect(() => {
    const connection = sessionStorage.getItem("acul_switch_connection");
    if (!connection) return;

    sessionStorage.removeItem("acul_switch_connection");
    setAutoSwitching(true);

    const state = screenProvider.transaction?.state ?? "";
    console.log("[LOGIN-PASSWORD] auto-switching to connection", {
      connection,
      state,
    });

    submitForm({ state, connection });
  }, [screenProvider]);

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordInput = event.target.querySelector(
      "input#password"
    ) as HTMLInputElement;

    try {
      console.log("[LOGIN-PASSWORD] manual login with password", {
        username: identifier,
      });
      await screenProvider.login({
        username: identifier,
        password: passwordInput?.value,
      });
    } catch (error) {
      console.error("[LOGIN-PASSWORD] Login failed:", error);
    }
  };

  if (autoSwitching) {
    // Keep the UI minimal while the POST redirect happens
    return (
      <div className="app-container">
        <div className="card">
          <CardHeader className="card-header">
            <CardTitle>Redirecting…</CardTitle>
            <CardDescription>
              Switching to your selected sign-in method.
            </CardDescription>
          </CardHeader>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <div className="test-css-inclusion" style={{ display: "none" }}>
          CSS Keepalive
        </div>

        <CardHeader className="card-header">
          <CardTitle className="card-title">{texts.title}</CardTitle>
          <CardDescription className="card-description">
            {texts.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <Text className="form-text mb-4">
            <span className="inline-block">Log in as </span>
            <span className="inline-block ml-1 font-bold">{identifier}</span>
            <Link
              className="form-link ml-2"
              href={screenProvider.screen.editIdentifierLink ?? "#"}
            >
              {texts.editEmailText}
            </Link>
          </Text>

          <Input
            type="hidden"
            name="identifier"
            id="identifier"
            value={identifier}
          />

          <div className="form-group">
            <Label htmlFor="password" className="form-label">
              {texts.passwordPlaceholder}
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="form-button">
            {texts.buttonText}
          </Button>

          <Text className="form-text mt-6">
            <Link
              className="form-link"
              href={screenProvider.screen.resetPasswordLink ?? "#"}
            >
              {texts.forgotPasswordText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  );
}
