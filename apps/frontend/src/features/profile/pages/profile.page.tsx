import { useState } from "react";
import { SettingsProfile } from "../components/settings-profile";
import { ProfileInput } from "../profile.schema";

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileInput>({
    name: "Alex Morgan",
    email: "alex.morgan@email.com",
    username: "alexmorgan",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar8.jpg",
    bio: "Product designer with 8+ years of experience crafting intuitive digital experiences. Currently focused on design systems and accessibility.",
  });

  const handleSave = (data: ProfileInput) => {
    setProfile(data);
    console.log("Profile saved successfully:", data);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <SettingsProfile defaultValues={profile} onSave={handleSave} />
    </div>
  );
}
