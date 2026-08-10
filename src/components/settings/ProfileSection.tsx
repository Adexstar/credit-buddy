import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, Check, Loader2, User, X } from "lucide-react";
import { toast } from "sonner";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/policies/ui";
import { SectionHeader, SubHeading } from "@/components/settings/SettingsSidebar";
import { useSettings } from "@/hooks/useSettings";
import { PASSWORD_RULES, type Profile } from "@/lib/settings";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({
  currentAvatar,
  name,
  onUpload,
}: {
  currentAvatar: string | null;
  name: string;
  onUpload: (dataUrl: string) => Promise<void>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file?: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("❌ Unsupported file type. Use JPG, PNG or GIF.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("❌ File too large. Maximum size is 5MB.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      await onUpload(dataUrl);
    } catch {
      toast.error("❌ Avatar upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await uploadFile(event.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center gap-4 rounded-2xl border border-dashed p-6 text-center transition sm:flex-row sm:text-left ${
        isDragging ? "border-vault-teal bg-vault-teal/5" : "border-vault-border bg-vault-bg/40"
      }`}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-vault-border bg-vault-raised">
        {currentAvatar ? (
          <img src={currentAvatar} alt={`${name} profile picture`} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center font-display text-2xl text-vault-teal">
            {name.charAt(0)}
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-vault-teal">
            <Loader2 size={20} className="animate-spin" />
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          aria-label="Upload profile picture"
          onChange={(e: ChangeEvent<HTMLInputElement>) => void uploadFile(e.target.files?.[0])}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
      <div className="min-w-0">
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-vault-foreground sm:justify-start">
          <Camera size={15} className="text-vault-teal" />
          Click or drop to upload a profile picture
        </p>
        <p className="mt-1 text-xs text-vault-faint">Supported: JPG, PNG, GIF (max 5MB)</p>
      </div>
    </div>
  );
}

export function ProfileSection() {
  const { profile, saving, saveProfile, uploadAvatar, changePassword } = useSettings();
  const [draft, setDraft] = useState<Profile | null>(profile);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  if (!profile) return null;
  const form = draft ?? profile;
  const dirty = JSON.stringify(form) !== JSON.stringify(profile);
  const rulesPass = PASSWORD_RULES.map((rule) => ({ ...rule, ok: rule.test(passwords.next) }));
  const passwordReady =
    passwords.current.length > 0 &&
    rulesPass.every((r) => r.ok) &&
    passwords.next === passwords.confirm;

  const onSave = async () => {
    const ok = await saveProfile({
      name: form.name,
      email: form.email,
      username: form.username,
      bio: form.bio,
    });
    if (ok) setDraft(null);
  };

  const onChangePassword = async () => {
    const ok = await changePassword(passwords.current, passwords.next);
    if (ok) setPasswords({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<User size={18} />}
        title="Profile settings"
        description="Your identity across the Credit Bank dashboard and receipts."
      />

      <AvatarUpload currentAvatar={form.avatar} name={form.name} onUpload={uploadAvatar} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input
            className={inputClass}
            value={form.name}
            maxLength={80}
            onChange={(e) => setDraft({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            value={form.email}
            maxLength={255}
            onChange={(e) => setDraft({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Username">
          <input
            className={inputClass}
            value={form.username}
            maxLength={40}
            onChange={(e) => setDraft({ ...form, username: e.target.value.replace(/\s/g, "") })}
          />
        </Field>
        <Field label="Plan">
          <div className="flex items-center gap-2 rounded-xl border border-vault-border bg-vault-bg px-3 py-2.5 text-sm text-vault-muted">
            <span className="capitalize text-vault-foreground">{form.plan}</span>
            <span className="text-xs text-vault-faint">· joined {new Date(form.joined).toLocaleDateString()}</span>
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Bio" hint="Optional — max 280 characters">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={form.bio}
              maxLength={280}
              onChange={(e) => setDraft({ ...form, bio: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={onSave} disabled={!dirty || saving}>
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save changes
        </PrimaryButton>
        <GhostButton onClick={() => setDraft(null)} disabled={!dirty}>
          Cancel
        </GhostButton>
      </div>

      <SubHeading>Change password</SubHeading>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Current password">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
        </Field>
        <Field label="New password">
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={passwords.next}
            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
          />
        </Field>
        <Field label="Confirm password">
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </Field>
      </div>

      <ul className="grid gap-2 rounded-xl border border-vault-border bg-vault-bg/40 p-4 sm:grid-cols-2">
        {rulesPass.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs ${rule.ok ? "text-vault-teal" : "text-vault-faint"}`}
          >
            {rule.ok ? <Check size={14} /> : <X size={14} />}
            {rule.label}
          </li>
        ))}
        <li
          className={`flex items-center gap-2 text-xs sm:col-span-2 ${
            passwords.confirm.length > 0 && passwords.next === passwords.confirm
              ? "text-vault-teal"
              : "text-vault-faint"
          }`}
        >
          {passwords.confirm.length > 0 && passwords.next === passwords.confirm ? (
            <Check size={14} />
          ) : (
            <X size={14} />
          )}
          Passwords match
        </li>
      </ul>

      <PrimaryButton onClick={onChangePassword} disabled={!passwordReady || saving}>
        {saving && <Loader2 size={15} className="animate-spin" />}
        Update password
      </PrimaryButton>
    </div>
  );
}
