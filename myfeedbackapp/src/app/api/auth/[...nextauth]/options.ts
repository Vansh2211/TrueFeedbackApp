import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import { is, th } from "zod/locales";



export const authOptions: NextAuthOptions = {
providers: [
    CredentialsProvider({
        id:"credentials",
        name:"Credentials",
        credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" }
    },

    async authorize(credentials:any): Promise<any>  {
        await dbConnect();
        
        try{
        const user = await UserModel.findOne({
          $or : [
            {email : credentials.identifier},
            {username : credentials.identifier}
          ]
        })

        if(!user){
          throw new Error("No user found with the given credentials"); 
        }

        if(!user.isVerified){
          throw new Error("Please verify your account to login"); 
        }

        await bcrypt.compare(credentials.password, user.password).then(isPasswordCorrect => {
          if(!isPasswordCorrect){
            throw new Error("Invalid Password");
          }
        });
      }
        catch(err:any){
            throw new Error("Authorize error:", err);
            return null;
    }
    }}
  )
],

callbacks:{
    async jwt({token, user}){

      if(user){
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.email = user.email;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }

      return token;
    },

    async session({session, token}){
      if(token){
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.email = token.email;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }

      return session; 
    }
},

pages :{
    signIn: '/signin'
},

session:{
  strategy: 'jwt'
},

secret : process.env.NEXTAUTH_SECRET

}