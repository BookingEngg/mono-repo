// Modules
import { useNavigate } from "react-router-dom";
// Atoms
import { Avatar, AvatarFallback, AvatarImage } from "@/atoms/ui/avatar";
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
// Services
import { logoutAuthUser } from "@/services/Auth.service";
// Store
import { getAuthUser, logout } from "@/store/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Utils
import { getInitials } from "@/utils/util";

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(getAuthUser);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  const handleLogout = async () => {
    await logoutAuthUser();
    dispatch(logout());
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

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
          <h1 className="text-2xl font-semibold">{fullName || "Your profile"}</h1>
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
    </div>
  );
};

export default Profile;
