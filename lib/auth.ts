import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { PrismaNeon } from "@prisma/adapter-neon";
import { admin as adminPlugin, username } from "better-auth/plugins";
import { ac, admin, customer } from "./permissions";
import { PrismaClient, UserRole } from "@prisma/client";
import { APIError } from "better-auth/api";
import { stripe } from "@/lib/stripe";
import { hasActiveAccess } from "./auth-guard";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  databaseHooks: {
    user: {
      create: {
        // Your purchase flow creates users. Anyone who gets here is unknown.
        before: async () => {
          throw new APIError("FORBIDDEN", {
            message: "We couldn't find a subscription for that account.",
            code: "SUBSCRIPTION_REQUIRED",
          });
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          if (!(await hasActiveAccess(session.userId))) {
            throw new APIError("FORBIDDEN", {
              message: "You need an active subscription to sign in.",
              code: "SUBSCRIPTION_REQUIRED",
            });
          }
          return { data: session };
        },
      },
    },
  },

  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "lvh.me:3000",
      "*.lvh.me:3000",
      "spoonacademy.com",
      "*.spoonacademy.com",
    ],
    fallback: "http://localhost:3000",
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://lvh.me:3000",
    "http://admin.lvh.me:3000",
    "https://admin.spoonacademy.com",
    "https://*.spoonacademy.com",
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        process.env.NODE_ENV === "production" ? ".spoonacademy.com" : ".lvh.me",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  emailAndPassword: {
    enabled: true,
  },

  account: {
    accountLinking: {
      enabled: true,
      updateUserInfoOnLink: true, // fills the picture when Google links to the seeded user
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      overrideUserInfoOnSignIn: true,
    },
  },

  user: {
    fields: {
      image: "avatarUrl",
    },
    additionalFields: {
      // ADD FIRST AND LAST NAME HERE TO MATCH CLIENT
      firstName: {
        type: "string",
        required: false, // Optional because they might just use a social login initially
      },
      lastName: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        defaultValue: UserRole.CUSTOMER,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    username(), // <-- ADD USERNAME PLUGIN HERE
    dash(),
    adminPlugin({
      defaultRole: UserRole.CUSTOMER,
      adminRoles: [UserRole.ADMIN],
      ac,
      roles: {
        ADMIN: admin,
        CUSTOMER: customer,
      },
    }),
  ],
});
