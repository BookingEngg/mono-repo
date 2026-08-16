// Modules
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// Pages
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import OAuthCallbackPage from "@/pages/OAuthCallback";
import HomePage from "@/pages/Home";
import ExplorePage from "@/pages/Explore";
import ProfilePage from "@/pages/Profile";
import NotFoundPage from "@/pages/NotFound";
// Layout
import AuthLayout from "@/layout/AuthLayout";
import MainLayout from "@/layout/MainLayout";
// Atoms
import { ErrorBoundary } from "@/atoms/ErrorBoundary";
// Services
import { getUser } from "@/services/Auth.service";
// Store
import { isUserAuthorized, login } from "@/store/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Icons
import { Loader2Icon } from "lucide-react";

const App = () => {
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector(isUserAuthorized);

  // Blocks the first paint so a signed-in creator is never flashed the login card
  const [isSessionResolved, setIsSessionResolved] = React.useState(false);

  React.useEffect(() => {
    const resolveSession = async () => {
      try {
        const response = await getUser();
        if (response?.status) {
          dispatch(login({ user: response.user, isAuthorized: true }));
        }
      } catch {
        // No valid cookie, the creator simply stays unauthenticated
      } finally {
        setIsSessionResolved(true);
      }
    };

    resolveSession();
  }, [dispatch]);

  if (!isSessionResolved) {
    return (
      <div className="bg-muted text-muted-foreground flex min-h-svh items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {isAuthorized ? (
          <>
            <Route element={<MainLayout />}>
              <Route path={ROUTE_PATHS.HOME} element={<HomePage />} />
              <Route path={ROUTE_PATHS.EXPLORE} element={<ExplorePage />} />
              <Route path={ROUTE_PATHS.PROFILE} element={<ProfilePage />} />
            </Route>
            {/* Any URL an authorized creator has no business on falls back here */}
            <Route path="*" element={<NotFoundPage />} />
          </>
        ) : (
          <>
            <Route element={<AuthLayout />}>
              {/* "/" is the landing route: a signed-out visitor starts at signup */}
              <Route
                path={ROUTE_PATHS.HOME}
                element={<Navigate to={ROUTE_PATHS.SIGNUP} replace />}
              />
              <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
              <Route path={ROUTE_PATHS.SIGNUP} element={<SignupPage />} />
              <Route
                path={ROUTE_PATHS.OAUTH_CALLBACK}
                element={<OAuthCallbackPage />}
              />
            </Route>
            {/*
              Rendered outside AuthLayout: NotFound owns the full page itself
              (its own header + full-bleed illustration), so it can't nest
              inside AuthLayout's own min-h-svh wrapper without fighting it
              for vertical space.
            */}
            <Route path="*" element={<NotFoundPage />} />
          </>
        )}
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
