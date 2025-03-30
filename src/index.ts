import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    TOKEN: string;
  };
}>();
app.get('/hi',(c)=>
{
  return c.text("Hi");
})
app.route("/api/user",userRouter);
app.route("/api/blog",blogRouter);

export default app;