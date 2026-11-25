export const BRAND = {
  name: "ELEVANTE",
  legalName: "ELEVANTE Digital Solutions",
  tagline: "Digital Solutions Agency",
  description:
    "ELEVANTE is a digital solutions agency building production websites, 3D web experiences, full-stack applications, AI solutions, data analytics, automation, and strategic brand design.",
  founders: [
    { name: "Pranav Lamkhade", role: "Founder" },
    { name: "Omkar Sable", role: "Co-Founder" },
  ],
  colors: {
    deepNavy: "#17264F",
    tealBlue: "#245B70",
    growthGreen: "#319C78",
    warmOffWhite: "#F5F6F2",
    white: "#FFFFFF",
    gradient: "linear-gradient(100deg, #17264F 0%, #245B70 52%, #319C78 100%)",
  },
  logos: {
    mark: { src: "/logos/Logo.png", width: 818, height: 613, alt: "ELEVANTE emblem" },
    horizontal: {
      src: "/logos/Horizontal-E-Logo.png",
      width: 2110,
      height: 527,
      alt: "ELEVANTE horizontal logo",
    },
    vertical: {
      src: "/logos/Vertical-E-Logo.png",
      width: 1296,
      height: 929,
      alt: "ELEVANTE vertical logo",
    },
  },
} as const;
