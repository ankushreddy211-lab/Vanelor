import { betterAuth } from "better-auth";
import { phoneNumber, magicLink } from "better-auth/plugins";
import { env } from "../env";
import { commsProvider } from "../comms/provider";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        await commsProvider.sendSMS({
          to: phoneNumber,
          message: `Your Valenor House verification code is: ${code}`,
        });
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }, request) => {
        await commsProvider.sendEmail({
          to: email,
          subject: "Sign in to Valenor",
          html: `<p>Click the link below to sign in:</p><p><a href="${url}">Sign In</a></p>`,
        });
      },
    }),
  ],
  secret: env.AUTH_SECRET,
  baseURL: env.APP_URL,
});