// Modules
import React from "react";
import { Link, useNavigate } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
import { FormField } from "@/molecules/FormField";
// Services
import { brandSignup, getUser } from "@/services/Auth.service";
// Store
import { login } from "@/store/auth";
import { useAppDispatch } from "@/store/hooks";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Utils
import { getErrorMessage, isValidEmail } from "@/utils/util";
// Icons
import { Loader2Icon } from "lucide-react";

const defaultPayloadValue = {
  brand_name: "",
  email: "",
  contact: "",
};

/**
 * Brand's own signup form — no OAuth, no password. Never linked from
 * /login or /signup, which are reserved for influencers. On success the
 * backend has already signed the brand in (jwt-token cookie set), so this
 * just hydrates the store and hands off to the onboarding step, where email
 * verification happens.
 */
const BrandSignup = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [payload, setPayload] = React.useState(defaultPayloadValue);
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<keyof typeof defaultPayloadValue, string>>
  >({});
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = React.useCallback(
    (value: string, key: keyof typeof defaultPayloadValue) => {
      setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
      setPayload((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const validate = React.useCallback(() => {
    const nextErrors: typeof fieldErrors = {};

    if (!payload.brand_name.trim()) {
      nextErrors.brand_name = "Enter your brand name";
    }
    if (!isValidEmail(payload.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!payload.contact.trim()) {
      nextErrors.contact = "Enter a contact number";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [payload]);

  const handleSubmit = React.useCallback(async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await brandSignup(payload);

      const response = await getUser();
      if (!response?.status) {
        setError("Account created, but the session could not be read.");
        return;
      }

      dispatch(login({ user: response.user, isAuthorized: true }));
      navigate(ROUTE_PATHS.BRAND_ONBOARDING);
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError, "We could not create your account."),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate, payload, validate]);

  return (
    <AuthCard
      title="Create your brand account"
      description="Tell us about your brand to get started."
      error={error}
      footer={
        <span className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={ROUTE_PATHS.BRAND_LOGIN}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <div className="grid gap-4">
        <FormField
          id="brand_name"
          label="Brand name"
          required
          placeholder="Acme Co."
          value={payload.brand_name}
          disabled={loading}
          error={fieldErrors.brand_name}
          onChange={(value) => handleChange(value, "brand_name")}
          onEnter={handleSubmit}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={payload.email}
          disabled={loading}
          error={fieldErrors.email}
          onChange={(value) => handleChange(value, "email")}
          onEnter={handleSubmit}
        />

        <FormField
          id="contact"
          label="Contact number"
          type="tel"
          required
          autoComplete="tel"
          placeholder="9876543210"
          value={payload.contact}
          disabled={loading}
          error={fieldErrors.contact}
          onChange={(value) => handleChange(value, "contact")}
          onEnter={handleSubmit}
        />

        <Button className="w-full" disabled={loading} onClick={handleSubmit}>
          {loading && <Loader2Icon className="animate-spin" />}
          Create account
        </Button>
      </div>
    </AuthCard>
  );
};

export default BrandSignup;
