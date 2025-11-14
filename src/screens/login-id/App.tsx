import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

type MethodsCache = {
  state: string | null;
  identifier: string;
  methods: Method[];
};

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

  // On mount: try to restore identifier + methods for this transaction state
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("acul_methods_cache");
      if (!raw) return;

      const parsed = JSON.parse(raw) as MethodsCache;
      const currentState = screenManager.transaction?.state ?? null;

      if (parsed.state && currentState && parsed.state === currentState) {
        console.log("[LOGIN-ID] Restoring methods from cache", parsed);
        setIdentifier(parsed.identifier);
        setMethods(parsed.methods);
      } else {
        console.log("[LOGIN-ID] Methods cache ignored (state mismatch)");
      }
    } catch (e) {
      console.warn("[LOGIN-ID] Failed to parse methods cache", e);
    }
  }, [screenManager]);

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setApiError(null);
    setMethods(null);

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

      const finalIdentifier = payload.identifier || value;
      const finalMethods = payload.methods ?? [];

      console.log("[LOGIN-ID] Methods payload =", payload);
      console.log("[LOGIN-ID] Final identifier/methods =", {
        finalIdentifier,
        finalMethods,
      });

      setIdentifier(finalIdentifier);
      setMethods(finalMethods);

      // Cache for this transaction's state so we can come back without re-API
      const state = screenManager.transaction?.state ?? null;
      const cache: MethodsCache = {
        state,
        identifier: finalIdentifier,
        methods: finalMethods,
      };
      sessionStorage.setItem("acul_methods_cache", JSON.stringify(cache));
      console.log("[LOGIN-ID] Cached methods for state", cache);
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
      await screenManager.login({ username: method.value });
      sessionStorage.setItem("acul_switch_connection", method.connection);
    } catch (e) {
      console.error("[LOGIN-ID] login() for passwordless failed", e);
    }
  };

  const handleEditIdentifier = () => {
    console.log("[LOGIN-ID] Edit identifier clicked");
    setMethods(null); // go back to step 1 for this transaction
    setApiError(null);
    sessionStorage.removeItem("acul_methods_cache");
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          {/* Identifier input (step 1 editable, step 2 read-only) */}
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

          {/* Continue button only on step 1 */}
          {!hasMethods && (
            <Button type="submit" className="form-button" disabled={loading}>
              {loading ? "Checking…" : texts.buttonText}
            </Button>
          )}

          {apiError && (
            <Text className="form-text mt-4 text-red-600">{apiError}</Text>
          )}

          {/* Step 2: Choose method */}
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
