import CalendarComponent from "@/components/CalendarComponent";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "rsuite";



export default async function page() {
 
 return (
  <div className="min-h-screen">
   <main className=" flex-col text-center items-center">
   <header className="bg-white p-4 flex justify-between items-center">
     <h1 className="text-3xl font-bold text-blue-500 ">Journals</h1>
     {/* <div className="flex items-center space-x-4">
   
     </div> */}
    </header>
   <div>
    <CalendarComponent />
   </div>
   <div className="flex p-4">
    <Button appearance="primary">
      <Link href="/journals/history">
      View Journal History
      </Link>
    </Button>
   </div>
   </main>
  </div>
 );
}
