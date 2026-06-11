import { ProfileInput } from "../profile.schema";

export interface ProfileState {
  data: ProfileInput;
  isLoading: boolean;
  error: string | null;
}
