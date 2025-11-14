import { ChangeEvent, useMemo, useState } from "react";
import { LoginId } from "@auth0/auth0-acul-js";

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

type Method =
  | { type: "password"; connection?: string; value?: string }
  | { type: "passwordless_email"; connection: string; value: string }
  | { type: "passwordless_phone"; connection: string; value: string }
  | { type: "enterprise"; connection: string };

const WORKFLOW_URL =
  "https://lyvoc-test-oie.workflows.oktapreview.com/api/flo/c9e7af317f61fd63c6abc65ca6513da1/invoke?clientToken=c410f7961bdb213639b530505ddb489421304ff0e97902e05c4e9b19a1355131";

export default function App() {
  const screenManager = useMemo(() => new LoginId(), []);

  const [identifier, setIdentifier] = useState("");
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const hasMethods = !!(methods && methods.length > 0);

  const texts = {
    title: screenManager.screen.texts?.title ?? "Welcome",
    description: screenManager.screen.texts?.description ?? "Login to continue",
    emailPlaceholder:
      screenManager.screen.texts?.emailPlaceholder ?? "Email or phone number",
    buttonText: screenManager.screen.texts?.buttonText ?? "Continue",
    footerText:
      screenManager.screen.texts?.footerText ?? "Don't have an account yet?",
    footerLinkText:
      screenManager.screen.texts?.footerLinkText ?? "Create your account",
  };

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setApiError(null);
    setMethods(null); // reset methods when re-checking

    const input = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;
    const value = input?.value?.trim() ?? "";

    setIdentifier(value);
    console.log("[LOGIN-ID] Identifier entered =", value);

    try {
      const res = await fetch(WORKFLOW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: value }),
      });

      if (!res.ok) {
        throw new Error(`Methods API responded ${res.status}`);
      }

      const payload = (await res.json()) as {
        identifier?: string;
        methods?: Method[];
      };

      console.log("[LOGIN-ID] Methods payload =", payload);
      setIdentifier(payload.identifier || value);
      setMethods(payload.methods ?? []);
    } catch (e) {
      console.error("[LOGIN-ID] Failed to fetch methods", e);
      setApiError("We couldn't look up your available sign-in methods.");
    } finally {
      setLoading(false);
    }
  };

  const choosePassword = async () => {
    console.log("[LOGIN-ID] choosePassword", { identifier });
    try {
      await screenManager.login({ username: identifier });
    } catch (e) {
      console.error("[LOGIN-ID] login() for password failed", e);
    }
  };

  const chooseEnterprise = (connection: string) => {
    console.log("[LOGIN-ID] chooseEnterprise", { connection });
    screenManager.federatedLogin({ connection });
  };

  const choosePasswordless = async (
    method: Extract<
      Method,
      { type: "passwordless_email" | "passwordless_phone" }
    >
  ) => {
    console.log("[LOGIN-ID] choosePasswordless", method);

    try {
      // 1) Set transaction username to the method identifier (email or phone)
      await screenManager.login({ username: method.value });

      // 2) Store only the connection type so login-password can auto-switch
      sessionStorage.setItem("acul_switch_connection", method.connection);
    } catch (e) {
      console.error("[LOGIN-ID] login() for passwordless failed", e);
    }
  };

  const handleEditIdentifier = () => {
    console.log("[LOGIN-ID] Edit identifier clicked");
    setMethods(null); // go back to step 1
    setApiError(null);
    // keep identifier value so user can adjust it
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          {/* Step 1: Identifier input (becomes read-only when methods are shown) */}
          <div className="form-group">
            <Label htmlFor="identifier" className="form-label">
              {texts.emailPlaceholder}
            </Label>
            <Input
              id="identifier"
              name="identifier"
              placeholder="john@example.com or +15551234567"
              autoFocus={!hasMethods}
              className={
                hasMethods
                  ? "form-input opacity-50 pointer-events-none bg-gray-100"
                  : "form-input"
              }
              autoComplete="username"
              inputMode="email"
              value={identifier}
              readOnly={hasMethods}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            {hasMethods && (
              <Button
                type="button"
                className="mt-2 text-sm underline px-0 shadow-none bg-transparent hover:bg-transparent"
                onClick={handleEditIdentifier}
              >
                Edit identifier
              </Button>
            )}
          </div>

          {/* Primary submit button: only visible on step 1 */}
          {!hasMethods && (
            <Button type="submit" className="form-button" disabled={loading}>
              {loading ? "Checking…" : texts.buttonText}
            </Button>
          )}

          {apiError && (
            <Text className="form-text mt-4 text-red-600">{apiError}</Text>
          )}

          {/* Step 2: Show available methods */}
          {hasMethods && (
            <div className="mt-6">
              <Text className="form-text mb-2">Choose a sign-in method:</Text>
              <div className="grid gap-2">
                {methods!.map((m, idx) => {
                  let label: string;
                  if (m.type === "password") {
                    label = "Password";
                  } else if (m.type === "passwordless_email") {
                    label = `Passwordless Email : ${m.value}`;
                  } else if (m.type === "passwordless_phone") {
                    label = `Passwordless Phone : ${m.value}`;
                  } else {
                    label = `Enterprise SSO : ${m.connection}`;
                  }

                  let onClick: () => void;
                  if (m.type === "password") {
                    onClick = () => void choosePassword();
                  } else if (m.type === "enterprise") {
                    onClick = () => void chooseEnterprise(m.connection);
                  } else {
                    onClick = () => void choosePasswordless(m);
                  }

                  return (
                    <Button
                      key={`${m.type}-${idx}`}
                      type="button"
                      className="w-full justify-start"
                      onClick={onClick}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <Text className="form-text mt-6">
            {texts.footerText}
            <Link
              href={screenManager.screen.signupLink ?? "#"}
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
