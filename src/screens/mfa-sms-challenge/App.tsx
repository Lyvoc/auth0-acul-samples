import { ChangeEvent } from "react";
import { MfaSmsChallenge } from "@auth0/auth0-acul-js";

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
// import { useState } from "react";

export default function App() {
  const screenManager = new MfaSmsChallenge();
  console.log("screenManager: ", screenManager);
  // const [type, setType] = useState("");

  // const handleSelect = (selectedType: string ) => {
  //   setType(selectedType);
  // };

  // const texts = {
  //   title: screenManager.screen.texts?.title ?? "Welcome",
  //   description:
  //     screenManager.screen.texts?.description ?? "Login to continue",
  //   emailPlaceholder:
  //     screenManager.screen.texts?.emailPlaceholder ?? "Enter your email",
  //   buttonText: screenManager.screen.texts?.buttonText ?? "Continue",
  //   footerText:
  //     screenManager.screen.texts?.footerText ?? "Don't have an account yet?",
  //   footerLinkText:
  //     screenManager.screen.texts?.footerLinkText ?? "Create your account",
  // };
  const texts = screenManager.screen.texts;

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifierInput = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;

    try {
      await screenManager.continueMfaSmsChallenge({
        code: identifierInput?.value,
        type: "sms",
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // let identifierDefaultValue = "";
  // if (typeof screenManager.screen.data?.username === "string") {
  //   identifierDefaultValue = screenManager.screen.data.username;
  // } else if (
  //   typeof screenManager.untrustedData.submittedFormData?.username === "string"
  // ) {
  //   identifierDefaultValue =
  //     screenManager.untrustedData.submittedFormData.username;
  // }
  // let phoneNumber = screenManager.screen.data?.phoneNumber
  // console.log('Phone number for challenge:', phoneNumber);
  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader className="card-header">
          <CardTitle>{texts?.title}</CardTitle>
          <CardDescription>{texts?.description}</CardDescription>
        </CardHeader>

        <CardContent className="card-content">
          <div className="form-group">
            <Label htmlFor="identifier" className="form-label">
              {texts?.placeholder}
            </Label>
            <Input
              id="identifier"
              name="identifier"
              // defaultValue={identifierDefaultValue}
              placeholder="john@example.com"
              autoFocus
              className="form-input"
            />
          </div>

          <Button type="submit" className="form-button">
            {texts?.continueButtonText}
          </Button>

          <Text className="form-text mt-6">
            {texts?.footerText}
            <Link
              // href={screenManager.screen.signupLink ?? "#"}
              className="form-link ml-1"
            >
              {texts?.footerLinkText}
            </Link>
          </Text>
        </CardContent>
      </form>
    </div>
  );
}
