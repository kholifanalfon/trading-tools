import { useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/use-register";
import { RegisterForm } from "../components/register-form";
import { RegisterInput } from "../auth.schema";

export function AuthRegisterPage() {
  const navigate = useNavigate();
  const { mutate, isLoading, error } = useRegister();

  const handleSubmit = (data: RegisterInput) => {
    mutate(data, {
      onSuccess: () => {
        // Redirect to login page on successful registration
        navigate("/login");
      },
    });
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <RegisterForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      onNavigateToLogin={handleNavigateToLogin}
    />
  );
}
