import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { Session } from "next-auth";
import { User } from "next-auth";
import dbConnect from "@/lib/mongodb/connection";

// Connect to MongoDB
const clientPromise = (async () => {
  const mongoose = await dbConnect();
  // @ts-ignore - The types for the MongoDB adapter are not compatible with mongoose
  return mongoose.connection.getClient();
})();

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "database" as "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

// Create and export the auth, signIn, signOut, and handlers functions
export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);
