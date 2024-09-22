import Image from "next/image";
import React from "react";
import bunnyImg from "../../../public/bunny-1.png";

export default function page() {
 return (
  <div className="bg-white min-h-screen flex justify-center">
   <div className=" flex text-center items-center">
    <h1 className="text-7xl tracking-widest bg-gradient-to-tr from-cyan-500 to-pink-500 bg-clip-text text-transparent p-5">Journal Page coming soon! ❤️</h1>
    <Image
     src={bunnyImg}
     width={200}
     height={200}
     alt="A cute bunny"
     className="animate-bounce object-contain"
    />
   </div>
  </div>
 );
}
