import { tokenSecretKey } from '@/config';
import JWT from 'jsonwebtoken';


class JwtService {
  private jwt = JWT;

  public createToken = (data: object) => {
    return this.jwt.sign(JSON.stringify(data), tokenSecretKey)
  }

  public verifyToken = (token: string) => {
    return this.jwt.verify(token, tokenSecretKey);
  }

}

export default JwtService;