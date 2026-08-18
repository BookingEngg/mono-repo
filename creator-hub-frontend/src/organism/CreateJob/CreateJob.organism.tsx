// Modules
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// Atoms
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { Alert, AlertDescription } from "@/atoms/ui/alert";
import { Label } from "@/atoms/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/atoms/ui/select";
// Molecules
import { FormField } from "@/molecules/FormField";
// Services
import { createJob } from "@/services/CreatorHub.service";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import {
  IAgeLimit,
  ICreateJobPayload,
  IEarningModel,
  IJobCategory,
  TConversionTrigger,
  TEarningModelType,
  TGender,
} from "@/typings/creatorHub";
// Utils
import { getErrorMessage } from "@/utils/util";
// Icons
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

const EARNING_MODEL_TYPES: { value: TEarningModelType; label: string }[] = [
  { value: "PERCENTAGE", label: "Percentage of order value" },
  { value: "FIXED_PER_ORDER", label: "Fixed amount per order" },
  { value: "CPC", label: "Cost per click" },
];

const CONVERSION_TRIGGERS: { value: TConversionTrigger; label: string }[] = [
  { value: "LINK_CLICK", label: "Link click" },
  { value: "PDP_VIEW", label: "Product page view" },
  { value: "ORDER_PLACED", label: "Order placed" },
  { value: "ORDER_DISPATCH", label: "Order dispatched" },
  { value: "DELIVERED", label: "Order delivered" },
  { value: "CANCELLED", label: "Order cancelled" },
];

const GENDERS: { value: TGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const defaultFormValue = {
  product_id: "",
  product_name: "",
  product_link: "",
  category_l1: "",
  category_l2: "",
  category_l3: "",
  category_l4: "",
  earning_model_type: "" as TEarningModelType | "",
  earning_model_value: "",
  earning_model_conversion_trigger: "" as TConversionTrigger | "",
  due_date: "",
  age_limit_lower: "",
  age_limit_upper: "",
  gender: "" as TGender | "",
};

type TFormValue = typeof defaultFormValue;
type TFieldErrors = Partial<Record<keyof TFormValue, string>>;

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// yyyy-mm-dd, matching <input type="date">'s value format
const getTodayDateString = (): string => new Date().toISOString().split("T")[0];

/**
 * Builds the exact payload createJobSchema expects, dropping any optional
 * group whose fields were left blank rather than sending empty strings.
 */
const buildPayload = (form: TFormValue): ICreateJobPayload => {
  const payload: ICreateJobPayload = {
    job_type: "affiliate",
    product_id: form.product_id.trim(),
    product_name: form.product_name.trim(),
    product_link: form.product_link.trim(),
  };

  const category: IJobCategory = {};
  if (form.category_l1.trim()) category.l1 = form.category_l1.trim();
  if (form.category_l2.trim()) category.l2 = form.category_l2.trim();
  if (form.category_l3.trim()) category.l3 = form.category_l3.trim();
  if (form.category_l4.trim()) category.l4 = form.category_l4.trim();
  if (Object.keys(category).length) {
    payload.category = category;
  }

  if (
    form.earning_model_type &&
    form.earning_model_value &&
    form.earning_model_conversion_trigger
  ) {
    const earningModel: IEarningModel = {
      type: form.earning_model_type,
      value: Number(form.earning_model_value),
      conversion_trigger: form.earning_model_conversion_trigger,
    };
    payload.earning_model = earningModel;
  }

  if (form.due_date) {
    payload.due_date = new Date(form.due_date).getTime();
  }

  if (form.age_limit_lower.trim() || form.age_limit_upper.trim()) {
    const ageLimit: IAgeLimit = {
      lower: form.age_limit_lower.trim() ? Number(form.age_limit_lower) : null,
      upper: form.age_limit_upper.trim() ? Number(form.age_limit_upper) : null,
    };
    payload.age_limit = ageLimit;
  }

  if (form.gender) {
    payload.gender = form.gender;
  }

  return payload;
};

const validate = (form: TFormValue): TFieldErrors => {
  const errors: TFieldErrors = {};

  if (!form.product_id.trim()) {
    errors.product_id = "Product ID is required";
  }
  if (!form.product_name.trim()) {
    errors.product_name = "Product name is required";
  }
  if (!form.product_link.trim()) {
    errors.product_link = "Product link is required";
  } else if (!isValidUrl(form.product_link.trim())) {
    errors.product_link = "Enter a valid URL";
  }

  if (form.due_date && form.due_date < getTodayDateString()) {
    errors.due_date = "Due date can't be in the past";
  }

  const lowerAge = form.age_limit_lower.trim()
    ? Number(form.age_limit_lower)
    : null;
  const upperAge = form.age_limit_upper.trim()
    ? Number(form.age_limit_upper)
    : null;

  if (lowerAge !== null && (!Number.isInteger(lowerAge) || lowerAge < 0)) {
    errors.age_limit_lower = "Enter a whole number, 0 or more";
  }
  if (upperAge !== null && (!Number.isInteger(upperAge) || upperAge < 0)) {
    errors.age_limit_upper = "Enter a whole number, 0 or more";
  }
  if (
    lowerAge !== null &&
    upperAge !== null &&
    !errors.age_limit_lower &&
    !errors.age_limit_upper &&
    lowerAge > upperAge
  ) {
    errors.age_limit_upper = "Max age can't be less than min age";
  }

  return errors;
};

const CreateJob = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState<TFormValue>(defaultFormValue);
  const [fieldErrors, setFieldErrors] = React.useState<TFieldErrors>({});
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleFieldChange = React.useCallback(
    (value: string, key: keyof TFormValue) => {
      setFieldErrors((previousErrors) => ({ ...previousErrors, [key]: "" }));
      setForm((previousForm) => ({ ...previousForm, [key]: value }));
    },
    []
  );

  const handleSubmit = React.useCallback(async () => {
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createJob(buildPayload(form));
      toast.success("Job posted successfully.");
      navigate(ROUTE_PATHS.HOME);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "We could not post this job."));
    } finally {
      setLoading(false);
    }
  }, [form, navigate]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        {/* MobileHeader already shows this tab's name below md */}
        <CardTitle className="hidden text-2xl md:block">Post a job</CardTitle>
        <CardDescription>
          List a new affiliate job for creators to apply to.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <FormField
            id="product_id"
            label="Product ID"
            required
            value={form.product_id}
            disabled={loading}
            error={fieldErrors.product_id}
            onChange={(value) => handleFieldChange(value, "product_id")}
          />

          <FormField
            id="product_name"
            label="Product name"
            required
            value={form.product_name}
            disabled={loading}
            error={fieldErrors.product_name}
            onChange={(value) => handleFieldChange(value, "product_name")}
          />

          <FormField
            id="product_link"
            label="Product link"
            type="url"
            required
            placeholder="https://example.com/product/123"
            value={form.product_link}
            disabled={loading}
            error={fieldErrors.product_link}
            onChange={(value) => handleFieldChange(value, "product_link")}
          />
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Product Category</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              id="category_l1"
              label="Level 1"
              value={form.category_l1}
              disabled={loading}
              onChange={(value) => handleFieldChange(value, "category_l1")}
            />
            <FormField
              id="category_l2"
              label="Level 2"
              value={form.category_l2}
              disabled={loading}
              onChange={(value) => handleFieldChange(value, "category_l2")}
            />
            <FormField
              id="category_l3"
              label="Level 3"
              value={form.category_l3}
              disabled={loading}
              onChange={(value) => handleFieldChange(value, "category_l3")}
            />
            <FormField
              id="category_l4"
              label="Level 4"
              value={form.category_l4}
              disabled={loading}
              onChange={(value) => handleFieldChange(value, "category_l4")}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Earning model</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="earning_model_type">Type</Label>
              <Select
                value={form.earning_model_type}
                disabled={loading}
                onValueChange={(value) =>
                  handleFieldChange(value ?? "", "earning_model_type")
                }
              >
                <SelectTrigger id="earning_model_type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                {/*
                  min-w overrides the popup's default anchor-matched width —
                  without it the dropdown was only as wide as its cramped
                  trigger, forcing these labels to truncate unreadably.
                */}
                <SelectContent className="min-w-56">
                  {EARNING_MODEL_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              id="earning_model_value"
              label="Value"
              type="number"
              min="0"
              value={form.earning_model_value}
              disabled={loading}
              onChange={(value) =>
                handleFieldChange(value, "earning_model_value")
              }
            />

            <div className="grid gap-2">
              <Label htmlFor="earning_model_conversion_trigger">Pays on</Label>
              <Select
                value={form.earning_model_conversion_trigger}
                disabled={loading}
                onValueChange={(value) =>
                  handleFieldChange(
                    value ?? "",
                    "earning_model_conversion_trigger"
                  )
                }
              >
                <SelectTrigger
                  id="earning_model_conversion_trigger"
                  className="w-full"
                >
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent className="min-w-56">
                  {CONVERSION_TRIGGERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            id="due_date"
            label="Due date"
            type="date"
            min={getTodayDateString()}
            value={form.due_date}
            disabled={loading}
            error={fieldErrors.due_date}
            onChange={(value) => handleFieldChange(value, "due_date")}
          />

          <FormField
            id="age_limit_lower"
            label="Min age"
            type="number"
            min="0"
            value={form.age_limit_lower}
            disabled={loading}
            error={fieldErrors.age_limit_lower}
            onChange={(value) => handleFieldChange(value, "age_limit_lower")}
          />

          <FormField
            id="age_limit_upper"
            label="Max age"
            type="number"
            min="0"
            value={form.age_limit_upper}
            disabled={loading}
            error={fieldErrors.age_limit_upper}
            onChange={(value) => handleFieldChange(value, "age_limit_upper")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={form.gender}
            disabled={loading}
            onValueChange={(value) => handleFieldChange(value ?? "", "gender")}
          >
            <SelectTrigger id="gender" className="w-full sm:w-48">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full sm:w-auto" disabled={loading} onClick={handleSubmit}>
          {loading && <Loader2Icon className="animate-spin" />}
          Post job
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateJob;
