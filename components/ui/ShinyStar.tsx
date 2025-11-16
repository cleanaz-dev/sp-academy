// ShinyStar.jsx

import { Star } from "lucide-react";

const ShinyStar = ({ className = "", ...props }) => {
  return (
    <Star
      className={`animate-glimmer h-5 w-5 rounded-full border fill-amber-200 text-amber-200 ${className}`}
      {...props}
    />
  );
};

export default ShinyStar;
