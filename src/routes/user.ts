import {Hono} from "hono"
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';


export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      TOKEN: string;
    };
  }>();

  userRouter.post('/signup', async (c) => {
    let body;
    try {
      body = await c.req.json(); // Try parsing JSON
    } catch (error) {
      console.error("Invalid JSON in request:", error);
      c.status(400);
      return c.json({ error: "Invalid JSON format" });
    }
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: body.password, 
        },
      });
  
      const jwt = await sign({ id: user.id }, c.env.TOKEN);
  
      return c.json({
        message: "User registered successfully",
        token: jwt,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error("Signup error:", error);
      c.status(500);
      return c.json({ error: "Something went wrong" });
    } finally {
      await prisma.$disconnect();
    }
  });

// SignIn Route
userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: body.email }
    });

    // Check if user exists
    if (!user) {
      c.status(403);
      return c.json({ error: "Invalid email or password" });
    }


    // Generate JWT token
    const jwt = await sign({ id: user.id }, c.env.TOKEN);

    // Return response with token
    return c.json({
      message: "Login successful",
      token: jwt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Signin error:", error);
    c.status(500);
    return c.json({ error: "Something went wrong" });
  } finally {
    await prisma.$disconnect();
  }
})