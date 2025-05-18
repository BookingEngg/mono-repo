// Module
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
// Rsuite
import { Button, Divider, FlexboxGrid, Input, InputGroup, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Services
import {
  sendOtp,
  verifyOtp,
  getUser,
  getOAuthClientDetails,
  getUserByGoogleOAuth,
} from "@/services/Login.service";
// Icons
import { GithubIcon } from "lucide-react";
// Store
import { login } from "@/store/auth";
import { useAppDispatch } from "@/store/hooks";
// Styles
import style from "./Login.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const defaultPayloadValue = {
  email: "",
  otp: "",
};

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loginPayload, setLoginPayload] = React.useState(defaultPayloadValue);
  const [isVerifyOtpVisible, setIsVerifyOtpVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const oAuthClientQuery = useQuery({
    queryKey: ["oauth-client-details"],
    queryFn: () => getOAuthClientDetails(),
  });
  const { data: clientDetails } = oAuthClientQuery;

  const handleFormPayloadChange = React.useCallback(
    (value: string, key: string) => {
      setLoginPayload({
        ...loginPayload,
        [key]: value,
      });
    },
    [loginPayload]
  );

  const handleOtpSend = React.useCallback(async () => {
    const inputValidation = !loginPayload.email.length;
    if (inputValidation) {
      return;
    }
    setLoading(true);
    await sendOtp(loginPayload);
    setIsVerifyOtpVisible(true);
    setLoading(false);
  }, [loginPayload]);

  const handleOtpVerify = React.useCallback(async () => {
    const inputValidation = !loginPayload.otp.length;
    if (inputValidation) {
      return;
    }

    setLoading(true);
    const otpResponse = await verifyOtp(loginPayload);
    if (otpResponse.status) {
      const response = await getUser();
      if (!!response.status) {
        dispatch(login({ user: response.user, isAuthorized: true }));
        navigate("/");
      }
    }
    setLoading(false);
  }, [loginPayload]);

  const handleGoogleOAuthLoginSuccess = async (payload: CredentialResponse) => {
    const response = payload.credential
      ? await getUserByGoogleOAuth({
          token: payload.credential,
        })
      : null;

    if (response?.is_verified_user) {
      const getAuthUser = await getUser();
      if (!!getAuthUser.status) {
        dispatch(login({ user: getAuthUser.user, isAuthorized: true }));
        navigate("/");
      }
    }
  };

  const handleGithubOAuthLogin = async () => {
    window.open(clientDetails?.github_init_url, "_self", "noreferrer");
  };

  return (
    <div className={cx("login-container")}>
      <div className={cx("signup-form-card")}>
        <Text size="xxl" weight="extrabold">
          Welcome Back!
        </Text>

        {isVerifyOtpVisible ? (
          <>
            <InputGroup inside size="lg">
              <InputGroup.Addon>Otp:</InputGroup.Addon>
              <Input
                value={loginPayload.otp}
                onChange={(value) => handleFormPayloadChange(value, "otp")}
              />
            </InputGroup>
            <FlexboxGrid
              justify="center"
              align="middle"
              style={{ marginTop: 10 }}
            >
              <Button
                appearance="primary"
                className={cx("action-cta")}
                loading={loading}
                onClick={handleOtpVerify}
              >
                Verify Otp
              </Button>
            </FlexboxGrid>
          </>
        ) : (
          <>
            <InputGroup inside size="md">
              <InputGroup.Addon>Email:</InputGroup.Addon>
              <Input
                autoComplete="off"
                value={loginPayload.email}
                onChange={(value) => handleFormPayloadChange(value, "email")}
              />
            </InputGroup>
            <Text size={"sm"} weight="thin">
              We'll send an OTP on this email
            </Text>
            <FlexboxGrid justify="center" style={{ marginTop: 40 }}>
              <FlexboxGridItem colspan={24}>
                <Button
                  appearance="primary"
                  className={cx("action-cta")}
                  loading={loading}
                  onClick={handleOtpSend}
                >
                  Generate Otp
                </Button>
              </FlexboxGridItem>

              <FlexboxGridItem
                colspan={24}
                className={cx("external-signup-div")}
              >
                <Divider className={cx("external-login-divider")}>
                  or continue with
                </Divider>
                <FlexboxGrid justify="space-around">
                  {clientDetails?.google_client_id ? (
                    <FlexboxGridItem>
                      <GoogleOAuthProvider
                        clientId={clientDetails.google_client_id}
                      >
                        <GoogleLogin
                          type="standard"
                          theme="outline"
                          text="signin"
                          shape="rectangular"
                          onSuccess={handleGoogleOAuthLoginSuccess}
                        />
                      </GoogleOAuthProvider>
                    </FlexboxGridItem>
                  ) : (
                    <></>
                  )}
                  {clientDetails?.github_init_url ? (
                    <FlexboxGridItem>
                      <Button
                        className={cx("external-github-cta")}
                        onClick={handleGithubOAuthLogin}
                      >
                        <GithubIcon /> Sign in
                      </Button>
                    </FlexboxGridItem>
                  ) : (
                    <></>
                  )}
                </FlexboxGrid>
              </FlexboxGridItem>
            </FlexboxGrid>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
