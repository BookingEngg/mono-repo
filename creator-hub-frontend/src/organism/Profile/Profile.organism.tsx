// Modules
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/atoms/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/atoms/ui/avatar";
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
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
import {
  getProfileDetails,
  logoutAuthUser,
  requestOnboardingApproval,
  updateOnboardingDetails,
} from "@/services/Auth.service";
// Store
import { getAuthUser, logout, updateUser } from "@/store/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Constants
import { ROLES } from "@/constants/access.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { IUpdateOnboardingPayload, TGender } from "@/typings/auth";
import { TProfileSection } from "@/typings/home";
// Utils
import { getErrorMessage, getInitials } from "@/utils/util";
// Icons
import {
  CheckCircle2Icon,
  Loader2Icon,
  LogOutIcon,
  SendIcon,
} from "lucide-react";

const GENDERS: { value: TGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const SECTIONS: TProfileSection[] = [
  "basic_details",
  "bank_details",
  "kyc_details",
];

const isSection = (value: string | null): value is TProfileSection =>
  !!value && SECTIONS.includes(value as TProfileSection);

// yyyy-mm-dd, matching <input type="date">'s value format
const toDateInputValue = (isoDate?: string | null): string =>
  isoDate ? isoDate.slice(0, 10) : "";

// The form works in strings; the API wants null for "cleared", not "".
const orNull = (value: string) => value.trim() || null;

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector(getAuthUser);

  const isCreator = (user?.roles ?? []).includes(ROLES.INFLUENCER);

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  // Bank and KYC details don't ride on the auth bootstrap, so this screen
  // fetches them itself. Creators only — a brand has no payout profile.
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-details"],
    queryFn: getProfileDetails,
    enabled: isCreator,
  });

  const [form, setForm] = React.useState({
    dob: "",
    gender: "" as TGender | "",
    instagram: "",
    facebook: "",
    youtube: "",
    house_number: "",
    addr: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    bank_account_number: "",
    ifsc_code: "",
    pan: "",
  });

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Seeded from the server once it arrives rather than held in useState
  // initialisers — the query resolves after first paint, so initialisers would
  // capture an empty profile and never update.
  React.useEffect(() => {
    if (!profile) return;

    setForm({
      dob: toDateInputValue(profile.dob),
      gender: profile.gender ?? "",
      instagram: profile.social_media_links?.instagram ?? "",
      facebook: profile.social_media_links?.facebook ?? "",
      youtube: profile.social_media_links?.youtube ?? "",
      house_number: profile.address?.house_number ?? "",
      addr: profile.address?.addr ?? "",
      landmark: profile.address?.landmark ?? "",
      city: profile.address?.city ?? "",
      state: profile.address?.state ?? "",
      pincode: profile.address?.pincode ?? "",
      bank_account_number: profile.bank_account_number ?? "",
      ifsc_code: profile.ifsc_code ?? "",
      pan: profile.pan ?? "",
    });
  }, [profile]);

  // A home widget links here with ?section=..., so the card it points at is
  // already open on arrival. Falls back to the first unfinished section.
  const sectionParam = searchParams.get("section");
  const [openSections, setOpenSections] = React.useState<TProfileSection[]>(
    isSection(sectionParam) ? [sectionParam] : [],
  );

  const [savingSection, setSavingSection] =
    React.useState<TProfileSection | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogout = async () => {
    await logoutAuthUser();
    dispatch(logout());
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  /**
   * Each section saves only its own fields. That's what makes partial setup
   * work: a creator can save bank details without a PAN to hand, and the
   * untouched sections are left alone rather than written back as null.
   */
  const handleSave = React.useCallback(
    async (section: TProfileSection) => {
      setSavingSection(section);
      setError("");

      const payloads: Record<TProfileSection, IUpdateOnboardingPayload> = {
        basic_details: {
          dob: orNull(form.dob),
          gender: form.gender || null,
          social_media_links: {
            instagram: orNull(form.instagram),
            facebook: orNull(form.facebook),
            youtube: orNull(form.youtube),
          },
          address: {
            house_number: orNull(form.house_number),
            addr: orNull(form.addr),
            landmark: orNull(form.landmark),
            city: orNull(form.city),
            state: orNull(form.state),
            pincode: orNull(form.pincode),
          },
        },
        bank_details: {
          bank_account_number: orNull(form.bank_account_number),
          ifsc_code: orNull(form.ifsc_code),
        },
        kyc_details: { pan: orNull(form.pan) },
      };

      try {
        const response = await updateOnboardingDetails(payloads[section]);

        // Completing every section flips the account to active, which changes
        // what the app lets the creator do — so the store has to hear about it.
        if (response.data?.account_status) {
          dispatch(updateUser({ account_status: response.data.account_status }));
        }

        queryClient.setQueryData(["profile-details"], response.data);
        // The home widgets are derived from these fields, so a saved section
        // should drop its card rather than wait for a reload.
        queryClient.invalidateQueries({ queryKey: ["home-widgets"] });

        toast.success("Profile updated.");
      } catch (caughtError) {
        setError(
          getErrorMessage(caughtError, "We could not update your profile."),
        );
      } finally {
        setSavingSection(null);
      }
    },
    [form, dispatch, queryClient],
  );

  /**
   * Hands the finished profile to review. Enabled only once every section is
   * complete — submitting a half-filled profile would just bounce back, so the
   * button says so rather than letting the creator find out from an error.
   */
  const handleSubmitForApproval = React.useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      await requestOnboardingApproval();
      toast.success("Profile submitted for approval.");
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError, "We could not submit your profile."),
      );
    } finally {
      setSubmitting(false);
    }
  }, []);

  const renderSaveButton = (section: TProfileSection) => (
    <Button
      className="mt-2 w-full"
      disabled={savingSection !== null}
      onClick={() => handleSave(section)}
    >
      {savingSection === section && <Loader2Icon className="animate-spin" />}
      Save
    </Button>
  );

  const renderSectionTitle = (label: string, done?: boolean) => (
    <span className="flex items-center gap-2">
      {label}
      {done && <CheckCircle2Icon className="size-4 text-emerald-600" />}
    </span>
  );

  const completion = profile?.completion;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {/*
            Google's photo CDN rejects requests that carry this page's
            referrer header, so the fallback initials would show forever
            without an explicit no-referrer policy here.
          */}
          <AvatarImage
            src={user?.user_profile_picture}
            alt={fullName}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="text-lg">
            {getInitials(user?.first_name, user?.last_name)}
          </AvatarFallback>
        </Avatar>

        <div className="grid gap-0.5">
          <h1 className="text-2xl font-semibold">
            {fullName || "Your profile"}
          </h1>
          {user?.email && (
            <p className="text-muted-foreground text-sm">{user.email}</p>
          )}
        </div>
      </div>

      {/*
        Creator-only: these details exist so brands can evaluate a creator and
        so we can pay them out. None of it applies to a brand's own account, so
        a brand sees just the header and the sign-out card. Gated by role rather
        than privilege because both account types hold PROFILE_UPDATE — the role
        is the only thing that distinguishes them here.
      */}
      <RequireAccess role={ROLES.INFLUENCER}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Your details</CardTitle>
            <CardDescription>
              Complete each section to start receiving payouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-destructive mb-3 text-sm">{error}</p>
            )}

            {isLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading your details…
              </div>
            ) : (
              <Accordion
                value={openSections}
                onValueChange={(value) =>
                  setOpenSections(value as TProfileSection[])
                }
              >
                <AccordionItem value="basic_details">
                  <AccordionTrigger>
                    {renderSectionTitle(
                      "Basic details",
                      completion?.basic_details,
                    )}
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="grid gap-4">
                      <FormField
                        id="dob"
                        label="Date of birth"
                        type="date"
                        value={form.dob}
                        disabled={savingSection !== null}
                        onChange={setField("dob")}
                      />

                      <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={form.gender}
                          disabled={savingSection !== null}
                          onValueChange={(value) =>
                            setField("gender")((value as TGender) ?? "")
                          }
                        >
                          <SelectTrigger id="gender" className="w-full">
                            <SelectValue placeholder="Select gender" />
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

                      <div className="grid gap-3">
                        <p className="text-sm font-medium">Address</p>
                        <FormField
                          id="house_number"
                          label="House / flat number"
                          value={form.house_number}
                          disabled={savingSection !== null}
                          onChange={setField("house_number")}
                        />
                        <FormField
                          id="addr"
                          label="Address"
                          placeholder="Street and area"
                          value={form.addr}
                          disabled={savingSection !== null}
                          onChange={setField("addr")}
                        />
                        <FormField
                          id="landmark"
                          label="Landmark"
                          value={form.landmark}
                          disabled={savingSection !== null}
                          onChange={setField("landmark")}
                        />
                        <FormField
                          id="city"
                          label="City"
                          value={form.city}
                          disabled={savingSection !== null}
                          onChange={setField("city")}
                        />
                        <FormField
                          id="state"
                          label="State"
                          value={form.state}
                          disabled={savingSection !== null}
                          onChange={setField("state")}
                        />
                        <FormField
                          id="pincode"
                          label="Pincode"
                          inputMode="numeric"
                          placeholder="560001"
                          value={form.pincode}
                          disabled={savingSection !== null}
                          onChange={setField("pincode")}
                        />
                      </div>

                      <div className="grid gap-3">
                        <p className="text-sm font-medium">Social media</p>
                        <FormField
                          id="instagram"
                          label="Instagram"
                          placeholder="https://instagram.com/yourhandle"
                          value={form.instagram}
                          disabled={savingSection !== null}
                          onChange={setField("instagram")}
                        />
                        <FormField
                          id="facebook"
                          label="Facebook"
                          placeholder="https://facebook.com/yourpage"
                          value={form.facebook}
                          disabled={savingSection !== null}
                          onChange={setField("facebook")}
                        />
                        <FormField
                          id="youtube"
                          label="YouTube"
                          placeholder="https://youtube.com/@yourchannel"
                          value={form.youtube}
                          disabled={savingSection !== null}
                          onChange={setField("youtube")}
                        />
                      </div>

                      {renderSaveButton("basic_details")}
                    </div>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem value="bank_details">
                  <AccordionTrigger>
                    {renderSectionTitle(
                      "Bank details",
                      completion?.bank_details,
                    )}
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="grid gap-4">
                      <FormField
                        id="bank_account_number"
                        label="Account number"
                        inputMode="numeric"
                        autoComplete="off"
                        value={form.bank_account_number}
                        disabled={savingSection !== null}
                        onChange={setField("bank_account_number")}
                      />
                      <FormField
                        id="ifsc_code"
                        label="IFSC code"
                        placeholder="HDFC0001234"
                        autoComplete="off"
                        hint="11 characters, as printed on your cheque book."
                        value={form.ifsc_code}
                        disabled={savingSection !== null}
                        onChange={(value) =>
                          setField("ifsc_code")(value.toUpperCase())
                        }
                      />

                      {renderSaveButton("bank_details")}
                    </div>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem value="kyc_details">
                  <AccordionTrigger>
                    {renderSectionTitle("KYC details", completion?.kyc_details)}
                  </AccordionTrigger>
                  <AccordionPanel>
                    <div className="grid gap-4">
                      <FormField
                        id="pan"
                        label="PAN"
                        placeholder="ABCDE1234F"
                        autoComplete="off"
                        hint="Required before your first payout."
                        value={form.pan}
                        disabled={savingSection !== null}
                        onChange={(value) => setField("pan")(value.toUpperCase())}
                      />

                      {renderSaveButton("kyc_details")}
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </RequireAccess>

      {/*
        Sits after the sections it submits and before sign-out. Creator-only —
        a brand has no profile to put through review.
      */}
      <RequireAccess role={ROLES.INFLUENCER}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Profile approval</CardTitle>
            <CardDescription>
              {completion?.is_complete
                ? "Your details are complete. Submit them for review to start receiving payouts."
                : "Fill in every section above, then submit your profile for review."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              disabled={submitting || !completion?.is_complete}
              onClick={handleSubmitForApproval}
            >
              {submitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
              Submit for profile approval
            </Button>
          </CardContent>
        </Card>
      </RequireAccess>

      {/*
        Last on the page and destructive-styled: signing out is the one action
        here a creator won't want to hit by accident while filling in a form.
      */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Signed in to Creator Hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOutIcon />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
