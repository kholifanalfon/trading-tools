import { SignJWT } from "jose";
import { config } from "@/core/config";
import { AuthRepository } from "./auth.repository";
import { RegisterInput, LoginInput } from "./auth.schema";
import { UnauthorizedError } from "@/core/errors/auth-error";

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

    // Dummy hash of same algorithm structure to execute verification when user is not found,
    // preventing user enumeration via timing analysis.
    const dummyHash =
      "$argon2id$v=19$m=65536,t=2,p=1$YHZwLuqWbhVFmYtOuCqtsKaxnCJX0TZie1kuwXEhw/I$a3hUn0MEkMpYeMWZXM9P5NlJnlRQOuK0AosnU8CD6us";
    const passwordToVerify = user ? user.userPassword : dummyHash;

    const isPasswordValid = await Bun.password.verify(
      data.password,
      passwordToVerify,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError();
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
