import { Button } from "@/components/old-ui/button";
import { Input } from "@/components/old-ui/input";
import { Textarea } from "@/components/old-ui/textarea";
import { MenuIcon } from "lucide-react";
import { BookOpen, Brain, Rocket, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Lobster } from "next/font/google";

const navItems = [
  { id: 1, label: "Our Mission", href: "#mission" },
  { id: 2, label: "Features", href: "#features" },
  { id: 3, label: "Testimonials", href: "#testimonials" },
  //  { id: 4, label: "Contact", href: "#contact" },
  { id: 5, label: "Sign In", href: "/sign-in" },
];

const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
});

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <BookOpen className="h-6 w-6 text-primary" />
          <p className="ml-2 text-2xl font-bold text-primary">
            <span className={lobster.className}> SP Academy</span>
          </p>
        </Link>

        <div className="flex items-center">
          <Button variant="ghost">
            <MenuIcon className="block text-primary sm:block md:block lg:hidden" />
          </Button>

          <nav className="ml-4 hidden gap-4 sm:gap-6 lg:flex">
            {navItems.map((item, id) => (
              <div key={id} className="flex items-center">
                <Link
                  href={item.href}
                  className={`text-lg font-medium underline-offset-4 hover:underline ${
                    item.label === "Sign In"
                      ? "rounded-md bg-white px-3 py-1 text-black transition-colors duration-300 hover:bg-indigo-200 hover:text-white hover:no-underline" // Add custom styles for "Sign In"
                      : ""
                  }`}
                >
                  <span className={lobster.className}>{item.label}</span>
                </Link>
              </div>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full bg-gradient-to-r from-indigo-200 to-yellow-100 py-12 md:py-24 lg:py-32 xl:py-48">
          {/* SVG */}
          {/* <Image
        src="/bg-shapes.svg"
        alt="SVG"
        width={1000}
        height={1000}
        className="object-cover absolute inset-0 w-full h-full z-10 pointer-events-none mt-10 animate-pulse"
        /> */}
          <div className="container relative z-20 mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-white">
                <div className="space-y-2">
                  <h1 className="text-3xl tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Welcome to Spoon Fed Academy
                  </h1>
                  <p className="max-w-[600px] font-thin text-zinc-600 md:text-xl">
                    Where learning is as easy as being spoon-fed! Join us for a
                    fun and engaging educational journey.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-primary shadow transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50"
                    href="/sign-up"
                  >
                    Get Started
                  </Link>
                  {/* <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50"
          href="#features"
         >
          Learn More
         </Link> */}
                </div>
              </div>
              <Image
                alt="Happy students learning"
                className="mx-auto overflow-hidden rounded-xl object-center sm:object-contain md:object-cover"
                height="550"
                src="/hero-image1.svg"
                width="550"
              />
            </div>
          </div>
        </section>
        <section
          id="mission"
          className="relative w-full bg-white py-12 md:py-24 lg:py-32"
        >
          {/* Mission Statement */}
          {/* SVG */}
          <Image
            src="/bg-shapes2.svg"
            alt="SVG"
            width={1000}
            height={1000}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full animate-pulse object-cover"
          />
          <div className="container relative z-20 mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="mb-6 text-4xl tracking-tighter sm:text-5xl">
                  Our Mission
                </h2>
                <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  At SP Academy, we believe in making learning accessible,
                  enjoyable, and effective for young minds. Our mission is to
                  spoon-feed knowledge in bite-sized, easily digestible pieces,
                  ensuring that every student can grasp complex concepts with
                  ease.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full bg-gradient-to-r from-indigo-200 to-yellow-100 py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl tracking-tighter text-white sm:text-5xl">
              Our Features
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border-zinc-200 bg-white p-4 shadow-sm">
                <Brain className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Interactive Lessons</h3>
                <p className="text-center text-zinc-500">
                  Engage with our fun and interactive learning materials
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border-zinc-200 bg-white p-4 shadow-sm">
                <Rocket className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Personalized Learning</h3>
                <p className="text-center text-zinc-500">
                  Tailored content that adapts to each student's pace
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border-zinc-200 bg-white p-4 shadow-sm">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Collaborative Projects</h3>
                <p className="text-center text-zinc-500">
                  Work together with peers on exciting group assignments
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="testimonials"
          className="relative w-full bg-white py-12 md:py-24 lg:py-32"
        >
          {/* Testimonials */}
          {/* SVG */}
          <Image
            src="/bg-shapes2.svg"
            alt="SVG"
            width={1000}
            height={1000}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full animate-pulse object-cover"
          />
          <div className="container relative z-20 mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl tracking-tighter sm:text-5xl">
              What Our Students Say
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border-zinc-200 bg-zinc-100 p-4">
                <Star className="h-8 w-8 text-yellow-400" />
                <p className="text-center italic text-zinc-500">
                  "SP Academy made learning fun! I love how easy it is to
                  understand difficult topics now."
                </p>
                <p className="font-semibold">- Sarah, 12</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border-zinc-200 bg-zinc-100 p-4">
                <Star className="h-8 w-8 text-yellow-400" />
                <p className="text-center italic text-zinc-500">
                  "As a parent, I'm amazed at how quickly my son has improved in
                  his studies. Thank you, SP Academy!"
                </p>
                <p className="font-semibold">- John's Mom</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border-zinc-200 bg-zinc-100 p-4">
                <Star className="h-8 w-8 text-yellow-400" />
                <p className="text-center italic text-zinc-500">
                  "The interactive lessons keep me engaged and excited to learn
                  more every day."
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
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-zinc-500">
          © 2023 SP Academy. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
