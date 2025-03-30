import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, sign, verify } from 'hono/jwt';

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      TOKEN: string;
    },
    Variables:{
      userId:string
    }
  }>();

  // Middle ware
blogRouter.use("/*", async (c, next) => {
  // Extract User id
  // pass down to router
  // is Loggedin - check the user id 
  // Or send to login or signup page
  // set and get use set to put and get request id from set
  // Bearer token like jwt decode the token
  const token=c.req.header("Authorization") || ""; // To get authHeader
  console.log(token);
  try {
    const user = await verify(token, c.env.TOKEN);

    if (user) {
      c.set("userId", user.id as string);
       await next();
    } else {
      c.status(403);
      return c.json({
        message: "You are not logged in"
      });
    }
  } catch (error) {
    c.status(403);
    return c.json({
      message: "Invalid token"
    });
  }

});

blogRouter.post('/upload', async(c)=>
{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
    
  const userId=c.get("userId")
  console.log("userId: ",userId);
  const body = await c.req.json().catch(() => null);
  console.log("Request Body:", body);
  if (!body) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
  try {
    const blog=await prisma.post.create({
      data:{
        title:body.title,
        content:body.content,
        authorId:userId,
      }
    });

    console.log(blog);
    return c.json({
      id:blog.id
    });

  } catch (error) {
    console.log(error);
  }

})

blogRouter.put("/update", async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
    
  const body=await c.req.json()
  try {
    const blog=await prisma.post.update({
      where:{
        id:body.id,
      },
      data:
      {
        title:body.title,
        content:body.content,
      }
    });

    return c.json({
      id:blog.id
    });
    
  } catch (error) {
    console.log(error);
  }
  });
  
blogRouter.get('/user/:id', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
    
  const id=await c.req.param("id");
  try {
    const blog=await prisma.post.findFirst({
      where:{
        id:id,
      }
    });

    return c.json({
      blog
    });
    
  } catch (error) {
    c.status(411);
    console.log(error);
  }
  });


  // pagination
blogRouter.get('/bulk',async  (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const res=await prisma.post.findMany();
    return c.json(res);
  } catch (error) {
    console.log(error);
  }
  });

  // Delete route
blogRouter.delete("/:id", async(c)=>
{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const id=await c.req.param("id");
  try {
    const res=await prisma.post.delete({
      where:{
        id:id
      }
    });

    return c.json(res);
  } catch (error) {
    return c.json({
      message:"Error in delete"
    })
  }
})