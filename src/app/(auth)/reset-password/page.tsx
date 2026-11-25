import { buildMetadata } from "@/lib/seo/metadata";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Set a new password for your ELEVANTE account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

