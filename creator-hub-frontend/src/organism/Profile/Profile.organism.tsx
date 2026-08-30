// Modules
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
import { Avatar, AvatarFallback, AvatarImage } from "@/atoms/ui/avatar";
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  logoutAuthUser,
  updateOnboardingDetails,
} from "@/services/Auth.service";
// Store
import { getAuthUser, logout, updateUser } from "@/store/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Constants
import { ROLES } from "@/constants/access.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { TGender } from "@/typings/auth";
// Utils
import { getErrorMessage } from "@/utils/util";
import { getInitials } from "@/utils/util";
// Icons
import { Loader2Icon } from "lucide-react";

const GENDERS: { value: TGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

// yyyy-mm-dd, matching <input type="date">'s value format
const toDateInputValue = (isoDate?: string | null): string =>
  isoDate ? isoDate.slice(0, 10) : "";

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(getAuthUser);

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  const [dateOfBirth, setDateOfBirth] = React.useState(
    toDateInputValue(user?.dob),
  );
  const [gender, setGender] = React.useState<TGender | "">(user?.gender ?? "");
  const [instagram, setInstagram] = React.useState(
    user?.social_media_links?.instagram ?? "",
  );
  const [facebook, setFacebook] = React.useState(
    user?.social_media_links?.facebook ?? "",
  );
  const [youtube, setYoutube] = React.useState(
    user?.social_media_links?.youtube ?? "",
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogout = async () => {
    await logoutAuthUser();
    dispatch(logout());
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  const handleSaveOnboarding = React.useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        dob: dateOfBirth || null,
        gender: gender || null,
        social_media_links: {
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
          youtube: youtube.trim() || null,
        },
      };
      const response = await updateOnboardingDetails(payload);
      dispatch(updateUser(response.data));
      toast.success("Profile updated.");
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError, "We could not update your profile."),
      );
    } finally {
      setSaving(false);
    }
  }, [dateOfBirth, gender, instagram, facebook, youtube, dispatch]);

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

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Signed in to Creator Hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/*
        Creator-only: date of birth, gender and social handles exist so brands
        can evaluate a creator. None of it applies to a brand's own account,
        so a brand sees just the header and Account card. Gated by role rather
        than privilege because both account types hold PROFILE_UPDATE — the
        role is the only thing that distinguishes them here.
      */}
      <RequireAccess role={ROLES.INFLUENCER}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Creator details</CardTitle>
            <CardDescription>
              Tell brands a bit more about yourself and where to find you.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && <p className="text-destructive text-sm">{error}</p>}

            <FormField
              id="dob"
              label="Date of birth"
              type="date"
              value={dateOfBirth}
              disabled={saving}
              onChange={setDateOfBirth}
            />

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender}
                disabled={saving}
                onValueChange={(value) => setGender((value as TGender) ?? "")}
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
              <p className="text-sm font-medium">Social media</p>

              <FormField
                id="instagram"
                label="Instagram"
                placeholder="https://instagram.com/yourhandle"
                value={instagram}
                disabled={saving}
                onChange={setInstagram}
              />
              <FormField
                id="facebook"
                label="Facebook"
                placeholder="https://facebook.com/yourpage"
                value={facebook}
                disabled={saving}
                onChange={setFacebook}
              />
              <FormField
                id="youtube"
                label="YouTube"
                placeholder="https://youtube.com/@yourchannel"
                value={youtube}
                disabled={saving}
                onChange={setYoutube}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={saving}
              onClick={handleSaveOnboarding}
            >
              {saving && <Loader2Icon className="animate-spin" />}
              Save
            </Button>
          </CardFooter>
        </Card>
      </RequireAccess>
    </div>
  );
};

export default Profile;
