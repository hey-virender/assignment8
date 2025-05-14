import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI);

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
    default: "low",
    enum: ["low", "high", "urgent"],
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const task = mongoose.model("task", taskSchema);

let items = [];
app.get("/", async (re, res) => {
  const tasks = await task.find();
  res.render("list", { items: tasks });
});

app.post("/", async (req, res) => {
  const { todo, priority } = req.body;
  if(!todo){
    return res.status(401).send("title is required")
  }
  console.log("task", todo, priority);
  const newTask = new task({
    title: todo,
    priority: priority,
  });
  await newTask.save();
  res.redirect("/");
});

app.post("/toggle/:id", async (req, res) => {
  const id = req.params.id;
  const existingTask = await task.findById(id);
  if (!existingTask) {
    return res.status(404).send("Task not found");
  }
  existingTask.completed = !existingTask.completed;
  await existingTask.save();
  res.redirect("/");
});

app.post("/delete/:id",async (req, res) => {
  const id = req.params.id;
  await task.findByIdAndDelete(id)
  res.redirect("/");
});

app.get("/edit/:id",async (req, res) => {
  const id = req.params.id;
  const item = await task.findById(id)
  if(!item){
    return res.status(404).send("Task not found")
  }
  res.render("edit", { item });
});

app.post("/edit/:id", (req, res) => {
  const id = Number(req.params.id);
  const newText = req.body.todo;
  const item = items.find((i) => i.id === id);
  if (item) item.text = newText;
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
