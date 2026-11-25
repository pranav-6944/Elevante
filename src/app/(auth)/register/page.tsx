import { buildMetadata } from "@/lib/seo/metadata";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = buildMetadata({
  title: "Create Account",
  description: "Create an ELEVANTE client account to request quotations and track projects.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterForm />;
}

