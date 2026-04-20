import { requireUnauth } from "@/lib/auth-utils";
import { RegisterForm } from "@/features/auth/components/register-form";

const Page = async () => {
  await requireUnauth();

  return <RegisterForm />;
};

export default Page;
