import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { LoginId as ScreenProvider } from "@auth0/auth0-acul-js";

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

export default function App() {
  const screenProvider = useMemo(() => new ScreenProvider(), []);

  const [passkeySupported, setPasskeySupported] = useState(false);
  const [conditionalMediation, setConditionalMediation] = useState(false);
  console.log("Render App: ", { passkeySupported, conditionalMediation });

  useEffect(() => {
    if (typeof window === "undefined") return;

    screenProvider
      .registerPasskeyAutofill("username")
      .catch((error: unknown) => {
        console.warn("Failed to register passkey autofill", { error });
      });
  }, [screenProvider]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSupport = async () => {
      try {
        const hasPlatform =
          typeof PublicKeyCredential !== "undefined" &&
          (await (
            PublicKeyCredential as any
          ).isUserVerifyingPlatformAuthenticatorAvailable?.()) === true;
        console.log("Passkey platform authenticator available: ", hasPlatform);

        const hasConditional =
          typeof PublicKeyCredential !== "undefined" &&
          (await (
            PublicKeyCredential as any
          ).isConditionalMediationAvailable?.()) === true;
        console.log(
          "Passkey conditional mediation available: ",
          hasConditional
        );

        setPasskeySupported(Boolean(hasPlatform));
        setConditionalMediation(Boolean(hasConditional));
      } catch {
        setPasskeySupported(false);
        setConditionalMediation(false);
      }
    };

    void checkSupport();
  }, []);

  const texts = {
    title: screenProvider.screen.texts?.title ?? "Welcome",
    description:
      screenProvider.screen.texts?.description ?? "Login to continue",
    emailPlaceholder:
      screenProvider.screen.texts?.emailPlaceholder ?? "Enter your email",
    buttonText: screenProvider.screen.texts?.buttonText ?? "Continue",
    footerText:
      screenProvider.screen.texts?.footerText ?? "Don't have an account yet?",
    footerLinkText:
      screenProvider.screen.texts?.footerLinkText ?? "Create your account",
  };

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifierInput = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;

    try {
      await screenProvider.login({ username: identifierInput?.value });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Login failed:", error);
    }
  };

  let identifierDefaultValue = "";
  if (typeof screenProvider.screen.data?.username === "string") {
    identifierDefaultValue = screenProvider.screen.data.username;
  } else if (
    typeof screenProvider.untrustedData.submittedFormData?.username === "string"
  ) {
    identifierDefaultValue =
      screenProvider.untrustedData.submittedFormData.username;
  }

  const showPasskeyHint = passkeySupported && conditionalMediation;

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="form-group">
            <Label htmlFor="identifier" className="form-label">
              {texts.emailPlaceholder}
            </Label>
            <Input
              id="identifier"
              name="identifier"
              defaultValue={identifierDefaultValue}
              placeholder="john@example.com"
              autoFocus
              className="form-input"
              // Tip: autocomplete helps some browsers with conditional UI
              autoComplete="username webauthn"
              inputMode="email"
            />
            {showPasskeyHint && (
              <Text className="form-text mt-2" aria-live="polite">
                Passkey available on this device ✨
                {/* Conditional UI will show the native account picker;
                    no extra click needed. This is just a hint. */}
              </Text>
            )}
          </div>

          <Button type="submit" className="form-button">
            {texts.buttonText}
          </Button>

          <Text className="form-text mt-6">
            {texts.footerText}
            <Link
              href={screenProvider.screen.signupLink ?? "#"}
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
