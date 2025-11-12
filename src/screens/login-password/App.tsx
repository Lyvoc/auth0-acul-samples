import { ChangeEvent, useEffect } from "react";
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
  // Hidden form POST back to the current UL endpoint (per Support guidance)
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
  const screenProvider = new ScreenProvider();
  console.log("screenProvider: ", screenProvider);

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

  // Auto-switch: if login-id stored intent (connection + username), post it here
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("acul_switch_to");
      if (!raw) return;

      const { connection, username } = JSON.parse(raw) as {
        connection: string;
        username?: string;
      };

      // Clear the intent to avoid loops
      sessionStorage.removeItem("acul_switch_to");

      // Post to UL with state + connection (+ username if provided)
      submitForm({
        state: screenProvider.transaction?.state ?? "",
        connection,
        ...(username ? { username } : {}),
      });
    } catch (e) {
      console.warn("Switch intent not available or invalid", e);
    }
  }, [screenProvider.transaction?.state]);

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

          {/* Optional: visible switch actions from here, if you want manual controls too */}
          {/* <div className="mt-6 grid gap-2">
            <Button
              type="button"
              className="w-full"
              onClick={() =>
                submitForm({
                  state: screenProvider.transaction?.state ?? "",
                  connection: "email",
                  username: identifier,
                })
              }
            >
              Switch to Passwordless Email
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={() =>
                submitForm({
                  state: screenProvider.transaction?.state ?? "",
                  connection: "sms",
                  username: identifier,
                })
              }
            >
              Switch to Passwordless SMS
            </Button>
          </div> */}
        </CardContent>
      </form>
    </div>
  );
}
