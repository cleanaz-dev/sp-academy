import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="mx-auto flex h-screen items-center justify-center align-middle">
      <SignIn />
    </div>
  );
}
