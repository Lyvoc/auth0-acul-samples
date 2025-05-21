import { ChangeEvent, useRef } from "react";
import { LoginPassword as ScreenProvider } from "@auth0/auth0-acul-js";

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
    forgottenPasswordText:
      screenProvider.screen.texts?.forgottenPasswordText ??
      "Forgot your Password?",
    editEmailText: screenProvider.screen.texts?.editEmailText ?? "Edit Email",
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

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-950">
      <form
        noValidate
        onSubmit={formSubmitHandler}
        className="bg-white text-black rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <CardHeader>
          <CardTitle className="mb-4 text-3xl font-bold text-center text-black">
            {texts.title}
          </CardTitle>
          <CardDescription className="mb-6 text-center text-gray-600">
            {texts.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
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

          <div className="mb-6">
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
            Need Help?
            <Link
              className="form-link"
              href={screenProvider.screen.resetPasswordLink ?? "#"}
            >
              {texts.forgottenPasswordText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  );
}
