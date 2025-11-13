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
  console.debug("[LOGIN-PASSWORD] submitForm called with", formValues);
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

  // compute at first paint to hide the whole screen if switching
  const initialSwitch = (() => {
    try {
      return !!sessionStorage.getItem("acul_switch_to");
    } catch {
      return false;
    }
  })();
  const [isSwitching, setIsSwitching] = useState<boolean>(initialSwitch);

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
    editEmailText: screenProvider.screen.texts?.editEmailText ?? "Edit Email",
    emailPlaceholder: screenProvider.screen.texts?.emailPlaceholder ?? "Email",
  };

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifierInput = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;
    const passwordInput = event.target.querySelector(
      "input#password"
    ) as HTMLInputElement;

    try {
      await screenProvider.login({
        username: identifierInput?.value,
        password: passwordInput?.value,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const identifier = screenProvider.screen.data?.username ?? "";

  useEffect(() => {
    if (!isSwitching) return;

    try {
      const raw = sessionStorage.getItem("acul_switch_to");
      console.debug("[LOGIN-PASSWORD] raw switch payload from storage", raw);

      if (!raw) {
        setIsSwitching(false);
        return;
      }

      sessionStorage.setItem("acul_switch_prefill", raw);
      sessionStorage.removeItem("acul_switch_to");

      const { connection, username } = JSON.parse(raw) as {
        connection: "email" | "sms";
        username: string;
      };

      const formValues = {
        state: screenProvider.transaction?.state ?? "",
        connection,
        username,
      };

      console.debug("[LOGIN-PASSWORD] submitting switch form", formValues);

      submitForm(formValues);
    } catch (e) {
      console.warn("[LOGIN-PASSWORD] switch error", e);
      setIsSwitching(false);
    }
  }, [isSwitching, screenProvider.transaction?.state]);

  return (
    <div
      className="app-container"
      style={{ display: isSwitching ? "none" : undefined }}
    >
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
          </Text>

          <Button
            type="button"
            className="w-full mt-4"
            onClick={() => {
              const href = screenProvider?.screen?.editIdentifierLink;
              if (href) globalThis.location.href = href;
              else history.back();
            }}
          >
            ← Back to sign-in options
          </Button>

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
