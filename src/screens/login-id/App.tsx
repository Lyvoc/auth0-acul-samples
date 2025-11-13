import { ChangeEvent, useMemo, useState } from "react";
import { LoginId } from "@auth0/auth0-acul-js";

// UI Components
import Button from "../../components/Button";
import { Label } from "../../components/Label";
import { Input } from "../../components/Input";
import { Text } from "../../components/Text";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/Card";

type Method =
  | { type: "password" }
  | { type: "passwordless_email"; connection: string; value: string }
  | { type: "passwordless_phone"; connection: string; value: string }
  | { type: "enterprise"; connection: string };

export default function App() {
  const screenManager = useMemo(() => new LoginId(), []);

  const [identifier, setIdentifier] = useState("");
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const texts = {
    title: "Bienvenue",
    description: "Connectez-vous pour continuer",
    emailPlaceholder: "Adresse e-mail ou téléphone",
    buttonText: "Continuer",
  };

  const formSubmitHandler = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setApiError(null);

    const input = event.target.querySelector(
      "input#identifier"
    ) as HTMLInputElement;
    const value = input?.value?.trim() ?? "";

    setIdentifier(value);
    console.log("[LOGIN-ID] Entered identifier =", value);

    try {
      const res = await fetch(
        "https://test-api.free.beeceptor.com/check-methods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: value }),
        }
      );

      if (!res.ok) throw new Error("API failed");

      const { methods } = await res.json();
      console.log("[LOGIN-ID] API methods payload =", methods);

      setMethods(methods || []);
    } catch (err) {
      console.error("[LOGIN-ID] fetch error:", err);
      console.warn("[LOGIN-ID] API failed → using fallback methods");
      setApiError("We couldn't reach method service. Using defaults.");

      setMethods([
        { type: "password" },
        {
          type: "passwordless_email",
          connection: "email",
          value: "jeremie.poisson@lyvoc.com",
        },
        {
          type: "passwordless_phone",
          connection: "sms",
          value: "+33663936646",
        },
      ]);
    }

    setLoading(false);
  };

  const choosePassword = async (method: Method) => {
    console.log("[LOGIN-ID] choosePassword", method, { identifier });
    await screenManager.login({ username: identifier });
  };

  const chooseEnterprise = (m: Method) => {
    console.log("[LOGIN-ID] chooseEnterprise", m);
    if ("connection" in m) {
      screenManager.federatedLogin({ connection: m.connection });
    } else {
      console.error("Method does not have a connection property:", m);
    }
  };

  const choosePasswordless = async (
    m: Extract<Method, { type: "passwordless_email" | "passwordless_phone" }>
  ) => {
    console.log("[LOGIN-ID] choosePasswordless", m);

    // Replace the transaction username first
    await screenManager.login({ username: m.value });

    // Now switch connection
    const state = screenManager.transaction?.state ?? "";
    console.log("[LOGIN-ID] submitForm for passwordless", {
      state,
      connection: m.connection,
      username: m.value,
    });

    const form = document.createElement("form");
    form.method = "POST";
    form.style.display = "none";
    form.action = "";

    for (const [key, value] of Object.entries({
      state,
      connection: m.connection,
    })) {
      const i = document.createElement("input");
      i.name = key;
      i.value = value;
      form.appendChild(i);
    }

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="app-container">
      <form noValidate onSubmit={formSubmitHandler} className="card">
        <CardHeader>
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="form-group">
            <Label htmlFor="identifier">{texts.emailPlaceholder}</Label>
            <Input
              id="identifier"
              name="identifier"
              placeholder="+33 6 12 34 56 78"
              autoFocus
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Checking…" : texts.buttonText}
          </Button>

          {apiError && <Text className="text-red-600">{apiError}</Text>}

          {methods && (
            <>
              <Text className="mt-4 mb-2">Choose a sign-in method:</Text>

              {methods.map((m, idx) => {
                const label =
                  m.type === "password"
                    ? "Password"
                    : m.type === "passwordless_email"
                    ? `Passwordless Email : ${m.value}`
                    : m.type === "passwordless_phone"
                    ? `Passwordless Phone : ${m.value}`
                    : `Enterprise SSO : ${m.connection}`;

                const handler =
                  m.type === "password"
                    ? () => choosePassword(m)
                    : m.type === "enterprise"
                    ? () => chooseEnterprise(m)
                    : () => choosePasswordless(m);

                return (
                  <Button key={idx} type="button" onClick={handler}>
                    {label}
                  </Button>
                );
              })}
            </>
          )}
        </CardContent>
      </form>
    </div>
  );
}
