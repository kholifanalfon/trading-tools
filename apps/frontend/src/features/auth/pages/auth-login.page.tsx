import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/use-login";
import { LoginForm } from "../components/login-form";
import { LoginInput } from "../auth.schema";

export function AuthLoginPage() {
  const navigate = useNavigate();
  const { mutate, isLoading, error } = useLogin();

  const handleSubmit = (data: LoginInput) => {
    mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const handleNavigateToRegister = () => {
    navigate("/register");
  };

  return <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} onNavigateToRegister={handleNavigateToRegister} />;
}
