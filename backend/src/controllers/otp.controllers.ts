import { Request, Response } from "express";
import JwtService from "@/services/jwt.service";
import OtpService from "@/services/otp.service";
import { IUser } from "@/interfaces/user.interface";

class OtpController {
  private jwtService = new JwtService();
  private otpService = new OtpService();

  public sendOtp = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    if (email) {
      await this.otpService.generateNewOtp(email);
    }
    return res.send({ status: "success" });
  };

  public verifyOtp = async (req: Request, res: Response): Promise<any> => {
    const { email, otp } = req.body;

    const user: IUser = await this.otpService.getVerifiedUser(email, otp);
    if (!user) {
      return res.status(500).send({ message: "Invalid Otp", status: false });
    }

    const token = await this.jwtService.createToken({ email: user.email });
    res.cookie("jwt-token", token, {
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.send({ message: "Otp Send Sucessfully", status: true });
  };
}

export default OtpController;
