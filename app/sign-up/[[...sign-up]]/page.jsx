import { SignUp } from "@clerk/nextjs";

export default function Page() {
 return (
  <div className=" flex mx-auto h-screen justify-center align-middle items-center">
   <SignUp />
  </div>
 );
}
