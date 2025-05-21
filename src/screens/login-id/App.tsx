import { ChangeEvent } from "react";
import { LoginId as ScreenProvider } from "@auth0/auth0-acul-js";


// UI Components
import Button from "../../common/Button";

import { Label } from "../../common/Label";
import { Input } from "../../common/Input";
import { Text } from "../../common/Text";
import { Link } from "../../common/Link"
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../common/Card";

export default function App() {
  const screenProvider = new ScreenProvider();

  const formSubmitHandler = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    const identifierInput = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;

    screenProvider.login({ username: identifierInput?.value });
  };

  // Extract the default value for the identifier input to avoid nested ternary
  let identifierDefaultValue = "";
  if (typeof screenProvider.screen.data?.username === "string") {
    identifierDefaultValue = screenProvider.screen.data.username;
  } else if (typeof screenProvider.untrustedData.submittedFormData?.username === "string") {
    identifierDefaultValue = screenProvider.untrustedData.submittedFormData.username;
  }

  return (
    <form noValidate onSubmit={formSubmitHandler}>
      <CardHeader>
        <CardTitle className="mb-2 text-3xl font-medium text-center">
          {screenProvider.screen.texts?.title ?? "Welcome"}
        </CardTitle>
        <CardDescription className="mb-8 text-center">
          {screenProvider.screen.texts?.description ?? "Login to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 space-y-2">
          <Label htmlFor="identifier">
            {screenProvider.screen.texts?.emailPlaceholder ??
              "Enter your email"}
          </Label>
          <Input
            type="text"
            id="identifier"
            name="identifier"
            defaultValue={identifierDefaultValue}
          />
        </div>
        <Button type="submit" className="w-full">
          {screenProvider.screen.texts?.buttonText ?? "Continue"}
        </Button>
        <Text className="mb-2">
          {screenProvider.screen.texts?.footerText ??
            "Don't have an account yet?"}
          <Link className="ml-1" href={screenProvider.screen.signupLink ?? "#"}>
            {screenProvider.screen.texts?.footerLinkText ??
              "Create your account"}
          </Link>
        </Text>
        <Text>
          Need Help?
          <Link
            className="ml-1"
            href={screenProvider.screen.resetPasswordLink ?? "#"}
          >
            {screenProvider.screen.texts?.forgottenPasswordText ??
              "Forgot your Password?"}
          </Link>
        </Text>
      </CardContent>
    </form>
  );
}
