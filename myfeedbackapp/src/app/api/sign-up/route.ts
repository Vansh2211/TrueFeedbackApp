import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/src/helpers/sendVerficationEmail";
import { success } from "zod";
import { useEffect } from "react";
import { Edu_AU_VIC_WA_NT_Arrows } from "next/font/google";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        const existingUserVerfiedByUsername = await UserModel.findOne({
            username: username,
            isVerified: true
        })

        const existingUserByEmail = await UserModel.findOne({
                email: email,
            })

            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();


        if(existingUserVerfiedByUsername) {
            return Response.json({
                 success: false,
                message : "Username is already taken"
            }, {status: 400})};


            if(existingUserByEmail) {
               if(existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email is already registered with a user"
                }, {status:400});
               }
               else {
                const hashedPassword = await bcrypt.hash(password,10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now

                await existingUserByEmail.save();
               }    
            }
            else{
                const hashedPassword =  await bcrypt.hash(password,10)
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1 );      
                
                const newUser = new UserModel({
                    username,
                    email,
                    password: hashedPassword,
                    verifyCode,
                    verifyCodeExpiry: expiryDate,
                    isVerified: false,
                    isAcceptingMessages: true,
                    messages: []

                })

                await newUser.save();
            }

            //send verification email
           const emailResponse =  await sendVerificationEmail(
            email,
            username,
            verifyCode
        );
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: "Failed to send verification email"
            }, {status:500});    
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please check your email for the verification code."
        }, {status:201})
        
    } catch(error) {
        console.error("Error registering user:", error);
        return Response.json({
             success: false,
             message: "Internal Server Error"
             }, {   
                status: 500
             });
    }
}