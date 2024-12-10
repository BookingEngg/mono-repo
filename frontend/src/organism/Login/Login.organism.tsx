import React from "react";
import { sendOtp, verifyOtp } from "@/services/Login.service";
import { Button } from "rsuite";

const Login = () => {
  React.useEffect(() => {
    const sendOtpHandler = async () => {
      await sendOtp();
    }
    sendOtpHandler();
  }, []);

  const verifyOtpHandler = async (otp: number) => {
    console.log("CLICK>>>")
    await verifyOtp(otp)
  }

  return <><Button onClick={() => {verifyOtpHandler(3303)}}>Verify</Button></>;
};

export default Login;
