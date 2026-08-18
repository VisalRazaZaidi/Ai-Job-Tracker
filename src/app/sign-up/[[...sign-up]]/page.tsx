import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </main>
  );
}
