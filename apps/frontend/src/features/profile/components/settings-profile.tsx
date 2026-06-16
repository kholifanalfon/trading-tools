import { Camera, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileInput, ProfileSchema } from "../profile.schema";
import { FileUpload, FileUploadItem, FileUploadItemDelete, FileUploadList, FileUploadTrigger } from "@/shared/components/ui/file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/cn";

export interface SettingsProfileProps {
  defaultValues?: Partial<ProfileInput>;
  onSave?: (data: ProfileInput) => void;
  className?: string;
}

export function SettingsProfile({
  defaultValues = {
    name: "Alex Morgan",
    email: "alex.morgan@email.com",
    username: "alexmorgan",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar8.jpg",
    bio: "Product designer with 8+ years of experience crafting intuitive digital experiences. Currently focused on design systems and accessibility.",
  },
  onSave,
  className,
}: SettingsProfileProps) {
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: defaultValues.name || "",
      email: defaultValues.email || "",
      username: defaultValues.username || "",
      avatar: defaultValues.avatar || "",
      bio: defaultValues.bio || "",
    },
  });

  const nameValue = watch("name");
  const avatarValue = watch("avatar");

  const initials = nameValue
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Get preview URL from uploaded file or use default avatar
  const avatarPreview = avatarFiles.length > 0 ? URL.createObjectURL(avatarFiles[0]) : avatarValue;

  // Sync avatarFiles back to react-hook-form value if it changes
  useEffect(() => {
    if (avatarFiles.length > 0) {
      setValue("avatar", URL.createObjectURL(avatarFiles[0]), { shouldValidate: true });
    }
  }, [avatarFiles, setValue]);

  const handleFormSubmit = (data: ProfileInput) => {
    onSave?.({
      ...data,
      avatar: avatarPreview,
    });
  };

  return (
    <Card className={cn("w-full max-w-lg bg-card text-card-foreground", className)}>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information and profile picture</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <FileUpload value={avatarFiles} onValueChange={setAvatarFiles} accept="image/*" maxFiles={1} maxSize={2 * 1024 * 1024}>
            <div className="flex items-center gap-4">
              <FileUploadTrigger asChild>
                <button
                  type="button"
                  className="group relative h-20 w-20 shrink-0 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview} alt={nameValue} className="object-cover" />
                    <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
              </FileUploadTrigger>

              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">Click the avatar to upload a new photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            {avatarFiles.length > 0 && (
              <FileUploadList className="mt-3">
                {avatarFiles.map((file, index) => (
                  <FileUploadItem key={index} value={file} className="rounded-lg border bg-muted/30 p-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <FileUploadItemDelete asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setAvatarFiles([]);
                          setValue("avatar", defaultValues.avatar || "", { shouldValidate: true });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            )}
          </FileUpload>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive font-semibold">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter username" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive font-semibold">{errors.username.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive font-semibold">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself" rows={4} {...register("bio")} />
            {errors.bio && <p className="text-xs text-destructive font-semibold">{errors.bio.message}</p>}
            <p className="text-xs text-muted-foreground">Brief description for your profile. Max 160 characters.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
