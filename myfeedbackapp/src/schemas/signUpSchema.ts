import {z} from "zod";

// export const signUpSchema = z.object({
//     username: z.string().min(3, "Username must be at least 3 characters long"),
//     email: z.string(), 
//     password: z.string().min(6, "Password must be at least 6 characters long")
// });

export const usernameValidationSchema = z.
string()
.min(2, "Username must be at least 2 characters long")
.max(20,"Username must be at most 20 characters long")
.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");


export const signUpSchema = z.object({
    username: usernameValidationSchema,
    email: z.email({message:"Invalid email address"}), 
    password: z.string().min(6, "Password must be at least 6 characters long")
});
