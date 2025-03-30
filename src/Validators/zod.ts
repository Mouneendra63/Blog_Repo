import z, { string } from "zod"

export const signupInput=z.object({
    name:z.string().optional(),
    email:z.string().email("Invalid email"),
    password:z.string().min(8,"Password must be at least 8 characters"),

})