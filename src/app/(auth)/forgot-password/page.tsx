import { buildMetadata } from "@/lib/seo/metadata";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Request a password recovery link for your ELEVANTE account.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

