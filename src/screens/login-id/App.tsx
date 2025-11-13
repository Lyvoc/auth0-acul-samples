import { ChangeEvent, /*useEffect,*/ useMemo, useState } from "react";
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

// Lean payload from your API
type Method =
  | { type: "password"; label?: string }
  | {
      type: "passwordless_email";
      connection: "email";
      value: string;
      label?: string;
    }
  | {
      type: "passwordless_phone";
      connection: "sms";
      value: string;
      label?: string;
    }
  | { type: "enterprise"; connection: string; label?: string };

type MethodsPayload = {
  methods: Method[];
  // Optional: if identifier is a phone but we must reach login-password with an email,
  // let the API give us a canonical email to use for login({ username })
  passwordLoginUsername?: string;
};

export default function App() {
  const screenManager = useMemo(() => new LoginId(), []);

  // const [passkeySupported, setPasskeySupported] = useState(false);
  // const [conditionalMediation, setConditionalMediation] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [passwordLoginUsername, setPasswordLoginUsername] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Prefill identifier from context/untrustedData
  let identifierDefaultValue = "";
  if (typeof screenManager.screen.data?.username === "string") {
    identifierDefaultValue = screenManager.screen.data.username;
  } else if (
    typeof screenManager.untrustedData.submittedFormData?.username === "string"
  ) {
    identifierDefaultValue =
      screenManager.untrustedData.submittedFormData.username;
  }

  // Continue → fetch available methods
  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setLoading(true);
    setMethods(null);
    setPasswordLoginUsername(null);

    const input = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;
    const value = (input?.value ?? "").trim();
    setIdentifier(value);

    try {
      const res = await fetch(
        // TODO: replace with your Okta Workflows endpoint
        "https://test-api.free.beeceptor.com/check-methods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: value }),
          credentials: "omit",
        }
      );
      if (!res.ok) throw new Error(`Methods API responded ${res.status}`);

      const payload = (await res.json()) as MethodsPayload;
      setMethods(payload.methods || []);
      if (payload.passwordLoginUsername) {
        setPasswordLoginUsername(payload.passwordLoginUsername);
      }
    } catch (e: unknown) {
      console.error("Failed to fetch methods", e);
      // ---- HARD-CODED FALLBACK (only if the API is unreachable) ----
      const emailFromInput =
        typeof value === "string" && value.includes("@")
          ? value
          : "jeremie.poisson@lyvoc.com";

      const fallback: {
        methods: (
          | { type: "password" }
          | { type: "passwordless_email"; connection: "email"; value: string }
          | { type: "passwordless_phone"; connection: "sms"; value: string }
          | { type: "enterprise"; connection: string }
        )[];
        passwordLoginUsername?: string;
      } = {
        methods: [
          { type: "password" },
          {
            type: "passwordless_email",
            connection: "email",
            value: emailFromInput,
          },
          {
            type: "passwordless_phone",
            connection: "sms",
            value: "+33663936646",
          },
          { type: "enterprise", connection: "acme-saml" },
        ],
        // If the user typed a phone number, we still need an EMAIL to reach login-password
        passwordLoginUsername: emailFromInput,
      };

      setMethods(fallback.methods);
      setPasswordLoginUsername(fallback.passwordLoginUsername ?? null);

      // Optional: show a soft warning but keep the flow usable
      setApiError(
        "We couldn't reach the method service. Using defaults for now."
      );
    } finally {
      setLoading(false);
    }
  };

  const toLoginPassword = async (username: string) => {
    await screenManager.login({ username }); // moves to login-password
  };

  const choosePassword = async () => {
    await toLoginPassword(identifier);
  };

  const chooseEnterprise = async (connection: string) => {
    screenManager.federatedLogin({ connection });
  };

  const choosePasswordlessEmail = async (email: string) => {
    const payload = { connection: "email" as const, username: email };
    console.debug("[LOGIN-ID] choosePasswordlessEmail payload", payload);
    sessionStorage.setItem("acul_switch_to", JSON.stringify(payload));
    await toLoginPassword(email);
  };

  const choosePasswordlessSms = async (phone: string) => {
    // Must reach login-password with an EMAIL username
    const emailToReachPassword = identifier.includes("@")
      ? identifier
      : passwordLoginUsername || "";

    if (!emailToReachPassword) {
      console.warn(
        "[LOGIN-ID] No emailToReachPassword available when choosing SMS",
        { identifier, passwordLoginUsername }
      );
      return;
    }

    const payload = { connection: "sms" as const, username: phone };
    console.debug("[LOGIN-ID] choosePasswordlessSms payload", payload, {
      emailToReachPassword,
    });

    sessionStorage.setItem("acul_switch_to", JSON.stringify(payload));
    await toLoginPassword(emailToReachPassword);
  };

  const methodsVisible = !!methods;

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          {/* Step 1: Identifier input (always visible) */}
          <div className="form-group">
            <Label htmlFor="identifier" className="form-label">
              {texts.emailPlaceholder}
            </Label>
            <Input
              id="identifier"
              name="identifier"
              defaultValue={identifierDefaultValue}
              placeholder="john@example.com or +15551234567"
              autoFocus
              className={`form-input ${
                methodsVisible ? "opacity-60 pointer-events-none" : ""
              }`}
              autoComplete="username webauthn"
              inputMode="email"
              disabled={methodsVisible} // greyed when methods shown
            />
          </div>

          {/* Hide Continue when methods are visible */}
          {!methodsVisible && (
            <Button type="submit" className="form-button" disabled={loading}>
              {loading ? "Checking…" : texts.buttonText}
            </Button>
          )}

          {apiError && (
            <Text className="form-text mt-4 text-red-600">{apiError}</Text>
          )}

          {/* Step 2: Show available methods */}
          {methodsVisible && methods && (
            <div className="mt-6">
              <Text className="form-text mb-2">Choose a sign-in method:</Text>
              <div className="grid gap-2">
                {methods.map((m, idx) => {
                  const label =
                    m.type === "password"
                      ? "Password"
                      : m.type === "passwordless_email"
                      ? `Passwordless Email : ${m.value}`
                      : m.type === "passwordless_phone"
                      ? `Passwordless Phone : ${m.value}`
                      : `Enterprise SSO : ${m.connection}`;

                  const onClick =
                    m.type === "password"
                      ? () => void choosePassword()
                      : m.type === "enterprise"
                      ? () => void chooseEnterprise(m.connection)
                      : m.type === "passwordless_email"
                      ? () => void choosePasswordlessEmail(m.value)
                      : () => void choosePasswordlessSms(m.value);

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
