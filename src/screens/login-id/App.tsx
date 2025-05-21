import { useRef, ChangeEvent } from "react";
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
  const screenProviderRef = useRef<ScreenProvider>(new ScreenProvider());
  const screenProvider = screenProviderRef.current;
  console.log("screenProvider: ", screenProvider);

  const texts = {
    title: screenProvider.screen.texts?.title ?? "Welcome",
    description: screenProvider.screen.texts?.description ?? "Login to continue",
    emailPlaceholder: screenProvider.screen.texts?.emailPlaceholder ?? "Enter your email",
    buttonText: screenProvider.screen.texts?.buttonText ?? "Continue",
    footerText: screenProvider.screen.texts?.footerText ?? "Don't have an account yet?",
    footerLinkText: screenProvider.screen.texts?.footerLinkText ?? "Create your account",
    forgottenPasswordText: screenProvider.screen.texts?.forgottenPasswordText ?? "Forgot your Password?",
  };

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifierInput = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;

    try {
      await screenProvider.login({ username: identifierInput?.value });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  let identifierDefaultValue = "";
  if (typeof screenProvider.screen.data?.username === "string") {
    identifierDefaultValue = screenProvider.screen.data.username;
  } else if (typeof screenProvider.untrustedData.submittedFormData?.username === "string") {
    identifierDefaultValue = screenProvider.untrustedData.submittedFormData.username;
  }

return (
  <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <form noValidate onSubmit={formSubmitHandler} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <CardHeader>
          <CardTitle className="mb-4 text-3xl font-bold text-center text-gray-900">
            {texts.title}
          </CardTitle>
          <CardDescription className="mb-6 text-center text-gray-600">
            {texts.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <Label htmlFor="identifier" className="form-label">
              {texts.emailPlaceholder}
            </Label>
            <Input
              type="text"
              id="identifier"
              name="identifier"
              defaultValue={identifierDefaultValue}
              placeholder="john@example.com"
              aria-label={texts.emailPlaceholder}
              className="form-input"
            />
          </div>

          <Button type="submit" className="form-button">
            {texts.buttonText}
          </Button>

          <Text className="form-text mt-6">
            {texts.footerText}
            <Link
              className="form-link"
              href={screenProvider.screen.signupLink ?? "#"}
            >
              {texts.footerLinkText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  </div>
);
}
