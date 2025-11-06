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

type Method =
  | { type: "password"; label?: string }
  | { type: "passwordless_email"; connection: string; label?: string }
  | { type: "passwordless_phone"; connection: string; label?: string }
  | { type: "enterprise"; connection: string; label?: string };

export default function App() {
  const screenManager = useMemo(() => new LoginId(), []);

  // passkey UI (unchanged)
  // const [passkeySupported, setPasskeySupported] = useState(false);
  // const [conditionalMediation, setConditionalMediation] = useState(false);

  // new state for dynamic methods
  const [identifier, setIdentifier] = useState("");
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // useEffect(() => {
  //   screenManager
  //     .registerPasskeyAutofill("username")
  //     .catch((error: unknown) => {
  //       console.warn("Failed to register passkey autofill", { error });
  //     });
  // }, [screenManager]);

  // useEffect(() => {
  //   const checkSupport = async () => {
  //     try {
  //       const hasPlatform =
  //         typeof PublicKeyCredential !== "undefined" &&
  //         (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()) ===
  //           true;

  //       const hasConditional =
  //         typeof PublicKeyCredential !== "undefined" &&
  //         (await PublicKeyCredential.isConditionalMediationAvailable?.()) ===
  //           true;

  //       setPasskeySupported(Boolean(hasPlatform));
  //       setConditionalMediation(Boolean(hasConditional));
  //     } catch {
  //       setPasskeySupported(false);
  //       setConditionalMediation(false);
  //     }
  //   };
  //   void checkSupport();
  // }, []);

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

  // prefill identifier from context/untrustedData
  let identifierDefaultValue = "";
  if (typeof screenManager.screen.data?.username === "string") {
    identifierDefaultValue = screenManager.screen.data.username;
  } else if (
    typeof screenManager.untrustedData.submittedFormData?.username === "string"
  ) {
    identifierDefaultValue =
      screenManager.untrustedData.submittedFormData.username;
  }

  // const showPasskeyHint = passkeySupported && conditionalMediation;

  // Submit: call external API to fetch available methods
  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setLoading(true);
    setMethods(null);

    const input = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;
    const value = input?.value?.trim() || "";
    setIdentifier(value);

    try {
      // NOTE: your Okta Workflows endpoint here
      const res = await fetch(
        "https://test-api.free.beeceptor.com/check-methods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: value,
          }),
          credentials: "omit",
        }
      );

      if (!res.ok) {
        throw new Error(`Methods API responded ${res.status}`);
      }

      const payload = (await res.json()) as {
        methods: Method[];
      };

      setMethods(payload.methods || []);
    } catch (e: unknown) {
      console.error("Failed to fetch methods", e);
      setApiError("We couldn't look up your available sign-in methods.");
    } finally {
      setLoading(false);
    }
  };

  const choosePassword = async () => {
    await screenManager.login({ username: identifier });
  };

  const chooseEnterprise = async (connection: string) => {
    screenManager.federatedLogin({
      connection: connection,
    });
  };

  const choosePasswordless = async (connection: string) => {
    await screenManager.login({ username: identifier, connection });
  };

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
              className="form-input"
              autoComplete="username webauthn"
              inputMode="email"
            />
            {/* {showPasskeyHint && (
              <button
                type="button"
                className="form-text mt-2 underline cursor-pointer text-left"
                onClick={() => screenManager.passkeyLogin()}
                aria-live="polite"
              >
                Passkey available on this device ✨ — Click to use
              </button>
            )} */}
          </div>

          {/* Primary submit triggers the methods lookup */}
          <Button type="submit" className="form-button" disabled={loading}>
            {loading ? "Checking…" : texts.buttonText}
          </Button>

          {/* Step 2: Show available methods */}
          {apiError && (
            <Text className="form-text mt-4 text-red-600">{apiError}</Text>
          )}

          {methods && (
            <div className="mt-6">
              <Text className="form-text mb-2">Choose a sign-in method:</Text>
              <div className="grid gap-2">
                {methods.map((m, idx) => {
                  let label: string;
                  if (m.label) {
                    label = m.label;
                  } else if (m.type === "password") {
                    label = "Password";
                  } else if (m.type === "passwordless_email") {
                    label = "Email magic link / code";
                  } else if (m.type === "passwordless_phone") {
                    label = "SMS code";
                  } else {
                    label = "Enterprise SSO";
                  }

                  let onClick: () => void;
                  if (m.type === "password") {
                    onClick = () => void choosePassword();
                  } else if (m.type === "enterprise") {
                    onClick = () => void chooseEnterprise(m.connection);
                  } else {
                    onClick = () => void choosePasswordless(m.connection);
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
