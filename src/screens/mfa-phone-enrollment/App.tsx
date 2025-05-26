import { ChangeEvent } from "react";
import { MfaPhoneEnrollment as ScreenProvider } from "@auth0/auth0-acul-js";

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
import { useState } from "react";

export default function App() {
  const screenProvider = new ScreenProvider();
  console.log("screenProvider: ", screenProvider);
  const [type, setType] = useState("");

  const handleSelect = (selectedType: string ) => {
    setType(selectedType);
  };

  // const texts = {
  //   title: screenProvider.screen.texts?.title ?? "Welcome",
  //   description:
  //     screenProvider.screen.texts?.description ?? "Login to continue",
  //   emailPlaceholder:
  //     screenProvider.screen.texts?.emailPlaceholder ?? "Enter your email",
  //   buttonText: screenProvider.screen.texts?.buttonText ?? "Continue",
  //   footerText:
  //     screenProvider.screen.texts?.footerText ?? "Don't have an account yet?",
  //   footerLinkText:
  //     screenProvider.screen.texts?.footerLinkText ?? "Create your account",
  // };
  const texts = screenProvider.screen.texts

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const identifierInput = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;

    try {
      if(type === "sms"){
        await screenProvider.continueEnrollment({ phone: identifierInput?.value,type : "sms" });
      }else{
        await screenProvider.continueEnrollment({ phone: identifierInput?.value,type : "voice" });
      }
      
    } catch (error) {
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
  let phoneNumber = screenProvider.screen.data?.phoneNumber
  console.log('Phone number for challenge:', phoneNumber);
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
              defaultValue={identifierDefaultValue}
              placeholder="john@example.com"
              autoFocus
              className="form-input"
            />
          </div>

          <Button type="submit" className="form-button">
            {texts?.continueButtonText}
          </Button>
          <button
            type = "button"
            onClick={() => handleSelect("sms")}
            className={`px-4 py-2 rounded-lg border 
              ${type === "sms" ? "bg-blue-600 text-white" : "bg-white text-gray-800 border-gray-300"}
              transition duration-200 shadow-md`}
          >
            SMS
          </button>
          <button
            type = "button"
            onClick={() => handleSelect("voice")}
            className={`px-4 py-2 rounded-lg border 
              ${type === "voice" ? "bg-blue-600 text-white" : "bg-white text-gray-800 border-gray-300"}
              transition duration-200 shadow-md`}
          >
            Voice Call
          </button>

          <Text className="form-text mt-6">
            {texts?.footerText}
            <Link
              // href={screenProvider.screen.signupLink ?? "#"}
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
