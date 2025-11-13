import { ChangeEvent, useMemo } from "react";
import { LoginPassword } from "@auth0/auth0-acul-js";

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
  const screenProvider = useMemo(() => new LoginPassword(), []);

  const identifier = screenProvider.screen?.data?.username ?? "";
  console.log("[LOGIN-PASSWORD] identifier from screen =", identifier);

  const texts = {
    title: screenProvider.screen?.texts?.title ?? "Enter your password",
    description:
      screenProvider.screen?.texts?.description ??
      "Enter the password for your account",
    buttonText: screenProvider.screen?.texts?.buttonText ?? "Continue",
    forgotPasswordText:
      screenProvider.screen?.texts?.forgotPasswordText ??
      "Forgot your password?",
    editEmailText:
      screenProvider.screen?.texts?.editEmailText ?? "Edit identifier",
  };

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    const passwordEl = event.target.querySelector(
      "input#password"
    ) as HTMLInputElement;

    console.log("[LOGIN-PASSWORD] submitting login()", {
      username: identifier,
      password: "***",
    });

    try {
      await screenProvider.login({
        username: identifier,
        password: passwordEl?.value,
      });
    } catch (err) {
      console.error("[LOGIN-PASSWORD] login() failed:", err);
    }
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader>
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <Text className="mb-4">
            Signing in as <strong>{identifier}</strong>
            <Link
              className="ml-2 form-link"
              href={screenProvider.screen?.editIdentifierLink ?? "#"}
            >
              {texts.editEmailText}
            </Link>
          </Text>

          <Input
            type="hidden"
            id="identifier"
            name="identifier"
            value={identifier}
          />

          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="form-input"
          />

          <Button type="submit" className="form-button mt-4">
            {texts.buttonText}
          </Button>

          <Text className="mt-6">
            <Link href={screenProvider.screen?.resetPasswordLink ?? "#"}>
              {texts.forgotPasswordText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  );
}
