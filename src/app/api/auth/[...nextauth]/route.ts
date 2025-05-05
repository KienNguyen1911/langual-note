import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect from "@/lib/mongodb/connection";
import mongoose from "mongoose";

// Connect to MongoDB
const clientPromise = (async () => {
  const mongoose = await dbConnect();
  // @ts-ignore - The types for the MongoDB adapter are not compatible with mongoose
  return mongoose.connection.getClient();
})();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

// Export the handlers as GET and POST
export const { GET, POST } = handlers;
