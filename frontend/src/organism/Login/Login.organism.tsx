import React, { useEffect } from "react";

import { sendOtp, verifyOtp, getUser } from "@/services/Login.service";
import { Button, Input } from "rsuite";

const Login = () => {

  const [otp, setOtp] = React.useState("");

  const verifyOtpHandler = async () => {
    await verifyOtp(otp);
  }

  return (
    <>
      <Button onClick={() => {sendOtp()}}>Send Otp</Button>
      {otp}
      <Input onChange={(value) => {setOtp(value)}} />
      <Button onClick={verifyOtpHandler}>Verify</Button>

      <Button onClick={() => {getUser()}}>GET USER</Button>
    </>
  );
};

export default Login;
