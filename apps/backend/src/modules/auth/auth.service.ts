import { SignJWT } from "jose";
import { config } from "../../core/config";
import { AuthRepository } from "./auth.repository";
import { RegisterInput, LoginInput } from "./auth.schema";

export class AuthService {
  private authRepository = new AuthRepository();
  private secret = new TextEncoder().encode(config.BE_JWT_SECRET);

  async register(data: RegisterInput) {
    const existingUser = await this.authRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await Bun.password.hash(data.password);
    const user = await this.authRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    const { userPassword: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(data: LoginInput) {
    const user = await this.authRepository.getUserByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await Bun.password.verify(data.password, user.userPassword);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = await this.generateToken({
      id: user.id,
      email: user.email,
    });

    const { userPassword: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  private async generateToken(payload: { id: number; email: string }) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.secret);
  }
}
