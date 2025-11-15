// landing-page-config.js

export const heroConfig = {
  badge: {
    text: "Learning Made Magical ✨",
    gradient: "from-sky-400 to-emerald-400",
  },
  
  title: {
    coloredText: "Spoon",
    letters: [
      { char: "S", color: "rgba(56, 189, 248, 1)" },   // sky-400
      { char: "p", color: "rgba(16, 185, 129, 1)" },   // emerald-500
      { char: "o", color: "rgba(251, 191, 36, 1)" },   // amber-400
      { char: "o", color: "rgba(251, 191, 36, 1)" },   // amber-400
      { char: "n", color: "rgba(192, 132, 252, 1)" },  // purple-400
    ],
    plainText: "Academy",
  },
  
  description: "Where every student's potential unfolds through playful learning and creative discovery. Join us on a journey of wonder and growth!",
  
  buttons: {
    primary: {
      text: "Begin the Adventure",
      href: "/sign-up",
      gradient: "from-sky-400 to-emerald-400",
      hoverGradient: "from-sky-500 to-emerald-500",
    },
    secondary: {
      text: "Take a Tour 🎯",
      variant: "outline",
      borderColor: "border-purple-400",
      textColor: "text-purple-400",
      hoverBg: "hover:bg-purple-50",
    },
  },
  
  image: {
    src: "/hero-image-01.png",
    alt: "Students learning together with technology",
    width: 600,
    height: 600,
  },
  
  animations: {
    glowColors: [
      "rgba(56, 189, 248, 1)",    // sky
      "rgba(16, 185, 129, 1)",    // emerald
      "rgba(251, 191, 36, 1)",    // amber
      "rgba(192, 132, 252, 1)",   // purple
    ],
    glowDuration: 4, // seconds
  },
  
  background: {
    gradient: "from-sky-400/10 via-emerald-400/10 to-purple-400/10",
    blobs: [
      {
        position: "left-[10%] top-[10%]",
        gradient: "from-sky-400 to-emerald-400",
        duration: 2,
        delay: 0,
      },
      {
        position: "bottom-[10%] right-[10%]",
        gradient: "from-amber-400 to-purple-400",
        duration: 3,
        delay: 1,
      },
    ],
  },
};

// Helper function to generate text shadow
export const generateTextShadow = (color) => `
  0 0 10px ${color},
  0 0 20px ${color.replace('1)', '0.8)')},
  0 0 30px ${color.replace('1)', '0.6)')}
`;

// Helper function to generate box shadow sequence
export const generateGlowSequence = (colors) => {
  return colors.map(color => `0 0 40px ${color.replace('1)', '0.6)')}`);
};


// Add this to your landing-page-config.js

export const footerConfig = {
  brand: {
    name: "Spoon Academy",
    tagline: "Learning Made Magical",
    description: "Empowering students through playful learning and creative discovery.",
  },
  
  links: {
    product: {
      title: "Product",
      items: [
        { label: "Features", href: "/features" },
        { label: "Possibilities", href: "/possibilities" },
        { label: "Testimonials", href: "/testimonials" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    company: {
      title: "Company",
      items: [
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    resources: {
      title: "Resources",
      items: [
        { label: "Help Center", href: "/help" },
        { label: "Community", href: "/community" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  },
  
  social: [
    { name: "Twitter", icon: "🐦", href: "https://twitter.com" },
    { name: "Facebook", icon: "📘", href: "https://facebook.com" },
    { name: "Instagram", icon: "📸", href: "https://instagram.com" },
    { name: "LinkedIn", icon: "💼", href: "https://linkedin.com" },
  ],
  
  copyright: {
    year: new Date().getFullYear(),
    text: "Spoon Academy. All rights reserved.",
  },
};