import { Home, Speech, ScrollText, BookMarked, GraduationCap, Settings } from "lucide-react";

export const navItems = [
  {
    label: "Home",
    href: "/home",
    icon: <Home strokeWidth={1.5} />,
  },
  {
    label: "Conversation",
    href: "/conversation",
    icon: <Speech strokeWidth={1.5} />,
  },
  {
    label: "Courses",
    href: "/courses",
    icon: <ScrollText strokeWidth={1.5} />,
  },
  {
    label: "Books",
    href: "/books",
    icon: <BookMarked strokeWidth={1.5} />,
  },
  {
    label: "Learning Hub",
    href: "/learning-hub",
    icon: <GraduationCap strokeWidth={1.5} />,
  },
];

export const settingItems = [
  {
    label: "Account",
    href: "/account",
    icon: <Settings strokeWidth={1.5} />,
  },
];

export default { navItems, settingItems };