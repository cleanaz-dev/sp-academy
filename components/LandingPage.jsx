import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MenuIcon } from "lucide-react";
import { BookOpen, Brain, Rocket, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navItems = [
 { id: 1, label: "Our Mission", href: "#mission" },
 { id: 2, label: "Features", href: "#features" },
 { id: 3, label: "Testimonials", href: "#testimonials" },
//  { id: 4, label: "Contact", href: "#contact" },
 {id: 5, label: "Sign In", href: "/sign-in" },
];

export default function LandingPage() {
 return (
  <div className="flex flex-col min-h-screen">
   <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
  <Link className="flex items-center justify-center" href="#">
    <BookOpen className="h-6 w-6 text-primary" />
    <span className="ml-2 text-2xl font-bold text-primary hidden md:block">
      SP Academy
    </span>
  </Link>

  <div className="flex items-center">
    <MenuIcon className="block sm:block md:block lg:hidden text-primary" />
    <nav className="ml-4 gap-4 sm:gap-6 hidden lg:flex">
      {navItems.map((item, id) => (
        <div key={id} className="flex items-center">
          <Link
        href={item.href}
        className={`text-sm font-medium hover:underline underline-offset-4 ${
          item.label === "Sign In"
            ? "bg-white text-black rounded-md px-3 py-1 hover:no-underline hover:bg-zinc-600 hover:text-white transition-colors duration-300" // Add custom styles for "Sign In"
            : ""
        }`}
      >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  </div>
</header>
   <main className="flex-1">
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-indigo-200 to-yellow-100">
     <div className="container px-4 md:px-6 mx-auto">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
       <div className="flex flex-col justify-center space-y-4 text-white">
        <div className="space-y-2">
         <h1 className="text-3xl tracking-tighter sm:text-5xl xl:text-6xl/none">
          Welcome to Spoon Fed Academy
         </h1>
         <p className="max-w-[600px] text-zinc-600 md:text-xl font-thin">
          Where learning is as easy as being spoon-fed! Join us for a fun and
          engaging educational journey.
         </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
         <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-primary shadow transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50"
          href="/sign-up"
         >
          Get Started
         </Link>
         <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50"
          href="#features"
         >
          Learn More
         </Link>
        </div>
       </div>
       <Image
        alt="Happy students learning"
        className="mx-auto overflow-hidden rounded-xl sm:object-contain md:object-cover object-center"
        height="550"
        src="/hero-image.svg"
        width="550"
       />
      </div>
     </div>
    </section>
    <section id="mission" className="w-full py-12 md:py-24 lg:py-32 bg-white">
     <div className="container px-4 md:px-6 mx-auto">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
       <div className="space-y-2">
        <h2 className="text-3xl tracking-tighter sm:text-5xl">
         Our Mission
        </h2>
        <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
         At SP Academy, we believe in making learning accessible, enjoyable, and
         effective for young minds. Our mission is to spoon-feed knowledge in
         bite-sized, easily digestible pieces, ensuring that every student can
         grasp complex concepts with ease.
        </p>
       </div>
      </div>
     </div>
    </section>
    <section
     id="features"
     className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-indigo-200 to-yellow-100"
    >
     <div className="container px-4 md:px-6 mx-auto">
      <h2 className="text-3xl tracking-tighter sm:text-5xl text-center mb-12 text-white">
       Our Features
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
       <div className="flex flex-col items-center space-y-2 border-zinc-200 p-4 rounded-lg bg-white shadow-sm">
        <Brain className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-bold">Interactive Lessons</h3>
        <p className="text-zinc-500 text-center">
         Engage with our fun and interactive learning materials
        </p>
       </div>
       <div className="flex flex-col items-center space-y-2 border-zinc-200 p-4 rounded-lg bg-white shadow-sm">
        <Rocket className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-bold">Personalized Learning</h3>
        <p className="text-zinc-500 text-center">
         Tailored content that adapts to each student's pace
        </p>
       </div>
       <div className="flex flex-col items-center space-y-2 border-zinc-200 p-4 rounded-lg bg-white shadow-sm">
        <Users className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-bold">Collaborative Projects</h3>
        <p className="text-zinc-500 text-center">
         Work together with peers on exciting group assignments
        </p>
       </div>
      </div>
     </div>
    </section>
    <section
     id="testimonials"
     className="w-full py-12 md:py-24 lg:py-32 bg-white"
    >
     <div className="container px-4 md:px-6 mx-auto">
      <h2 className="text-3xl tracking-tighter sm:text-5xl text-center mb-12">
       What Our Students Say
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
       <div className="flex flex-col items-center space-y-2 border-zinc-200 p-4 rounded-lg bg-zinc-100">
        <Star className="h-8 w-8 text-yellow-400" />
        <p className="text-zinc-500 text-center italic">
         "SP Academy made learning fun! I love how easy it is to understand
         difficult topics now."
        </p>
        <p className="font-semibold">- Sarah, 12</p>
       </div>
       <div className="flex flex-col items-center space-y-2 border-zinc-200 p-4 rounded-lg bg-zinc-100">
        <Star className="h-8 w-8 text-yellow-400" />
        <p className="text-zinc-500 text-center italic">
         "As a parent, I'm amazed at how quickly my son has improved in his
         studies. Thank you, SP Academy!"
        </p>
        <p className="font-semibold">- John's Mom</p>
       </div>
       <div className="flex flex-col items-center space-y-2 border-zinc-200 p-4 rounded-lg bg-zinc-100">
        <Star className="h-8 w-8 text-yellow-400" />
        <p className="text-zinc-500 text-center italic">
         "The interactive lessons keep me engaged and excited to learn more
         every day."
        </p>
        <p className="font-semibold">- Mike, 15</p>
       </div>
      </div>
     </div>
    </section>
    {/* <section
     id="contact"
     className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white"
    >
     <div className="container px-4 md:px-6 mx-auto">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
       <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
         Get in Touch
        </h2>
        <p className="max-w-[600px] text-zinc-200 md:text-xl">
         Have questions or ready to start your learning journey? Reach out to
         us!
        </p>
       </div>
       <div className="w-full max-w-sm space-y-2">
        <form className="flex flex-col gap-4">
         <Input
          className="bg-white text-zinc-900"
          placeholder="Your Name"
          type="text"
         />
         <Input
          className="bg-white text-zinc-900"
          placeholder="Your Email"
          type="email"
         />
         <Textarea
          className="bg-white text-zinc-900"
          placeholder="Your Message"
         />
         <Button
          className="bg-white text-primary hover:bg-zinc-100"
          type="submit"
         >
          Send Message
         </Button>
        </form>
       </div>
      </div>
     </div>
    </section> */}
   </main>
   <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
    <p className="text-xs text-zinc-500">
     © 2023 SP Academy. All rights reserved.
    </p>
    <nav className="sm:ml-auto flex gap-4 sm:gap-6">
     <Link className="text-xs hover:underline underline-offset-4" href="#">
      Terms of Service
     </Link>
     <Link className="text-xs hover:underline underline-offset-4" href="#">
      Privacy
     </Link>
    </nav>
   </footer>
  </div>
 );
}
