import { Request, Response } from "express";
import JwtService from "@/services/jwt.service";
import OtpService from "@/services/otp.service";

class OtpController {
  private jwtService = new JwtService();
  private otpService = new OtpService();

  public sendOtp = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    await this.otpService.generateNewOtp(email);
    return res.send({ status: "success" });
  };

  public verifyOtp = async (req: Request, res: Response): Promise<any> => {
    const { email, otp } = req.body;

    const user = await this.otpService.verifyOtp(email, otp);
    if (!user) {
      return res.send({ status: "Invalid Otp" });
    }

    const token = await this.jwtService.createToken(user);
    res.cookie("jwt-token", token);
    return res.send({ status: "success" });
  };
}

export default OtpController;
