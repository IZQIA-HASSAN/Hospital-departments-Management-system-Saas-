import {z} from "zod"

export const  signupschema = z.object({
    name:z
    .string({required_error:"Name is required"})
    .trim()
    .min(2 , "Name must be atleast 2 characters")
    .max(50 , "Name is too long"),

    password:z
    .string({required_error:"Password is required"})
    .min(8 , "Password must be atleast 8 characters")
    .max(72 , "Password is too long")
    .regex(/[a-z]/ , "Password must contain a lower case letter")
    .regex(/[A-Z]/ , "Password must contain an upper case letter")
    .regex(/[0-9]/ , "Password must contain a number"),

    email:z
    .string({required_error:"Email is required"})
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),

    title:z
    .string({required_error:"title is required"})
    .trim()
    .min(1 , "title is required"),
})

export const staffsignup = z.object({
    token:z
    .string({required_error:"Name is required"})
    .trim()
    .min(1 , "Invite token is required"),

    name:z
    .string({required_error:"Name is required"})
    .trim()
    .min(2 , "Name must be atleast 2 charaters")
    .max(50 , "Name is too long"),

    password:z
    .string({required_error:"Password is reuired"})
    .min(8 , "Password should be minimum 8  characters long")
    .max(15 , "max lengh should be 15 characters")
    .regex(/[a-z]/ , "password must contain a lower case letter")
    .regex(/[A-Z]/ , "Password must contain an uppercase letter")
    .regex(/[0-9]/ , "Password must contain a number"),

    title:z.string().trim().optional(),


})

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

