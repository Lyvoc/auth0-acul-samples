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
    
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
<div className="space-y-4">
  <div className="test-base-file">Base.css is working</div>
  <div className="test-components-file">Components.css is working</div>
  <div className="test-forms-file">Forms.css is working</div>
</div>
      <form noValidate onSubmit={formSubmitHandler} className="max-w-md w-full p-6 bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="mb-2 text-3xl font-medium text-center text-black">
            {texts.title}
          </CardTitle>
          <CardDescription className="mb-8 text-center text-gray-600">
            {texts.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Label htmlFor="identifier" className="text-black">
              {texts.emailPlaceholder}
            </Label>
            <Input
              type="text"
              id="identifier"
              name="identifier"
              defaultValue={identifierDefaultValue}
              aria-label={texts.emailPlaceholder}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            {texts.buttonText}
          </Button>
          <Text className="mt-4 text-center text-sm text-gray-700">
            {texts.footerText}
            <Link className="ml-1 text-blue-600 hover:underline" href={screenProvider.screen.signupLink ?? "#"}>
              {texts.footerLinkText}
            </Link>
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-700">
            Need Help?
            <Link className="ml-1 text-blue-600 hover:underline" href={screenProvider.screen.resetPasswordLink ?? "#"}>
              {texts.forgottenPasswordText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  );
}
