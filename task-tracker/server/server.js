const express = require("express")
const cors = require("cors")
const fs = require("fs")

const app = express()
app.use(cors())
app.use(express.json())

const dataFile = "./data/tasks.json"

function loadTasks() {
  let data = fs.readFileSync(dataFile)
  return JSON.parse(data)
}

function saveTasks(arr) {
  fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2))
}

app.get("/tasks", (req, res) => {
  let allTasks = loadTasks()
  res.json(allTasks)
})

app.post("/tasks", (req, res) => {
  let allTasks = loadTasks()

  let newTask = {
    id: Date.now(),
    name: req.body.name,
    task: req.body.task,
    week: req.body.week,
    priority: req.body.priority ? req.body.priority : "medium",
    status: "pending"
  }

  allTasks.push(newTask)
  saveTasks(allTasks)
  res.json(newTask)
})

// change status of a task
app.put("/tasks/:id", (req, res) => {
  let allTasks = loadTasks()
  let id = Number(req.params.id)

  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].id === id) {
      allTasks[i].status = req.body.status
    }
  }

  saveTasks(allTasks)
  res.json({ msg: "updated" })
})

// edit task details
app.put("/tasks/:id/edit", (req, res) => {
  let allTasks = loadTasks()
  let id = Number(req.params.id)
  let task = allTasks.find(t => t.id == id)

  if (!task) {
    res.status(404).json({ msg: "not found" })
    return
  }

  task.name = req.body.name
  task.task = req.body.task
  task.week = req.body.week
  task.priority = req.body.priority

  saveTasks(allTasks)
  res.json(task)
})

app.delete("/tasks/:id", (req, res) => {
  let allTasks = loadTasks()
  let id = Number(req.params.id)
  allTasks = allTasks.filter(t => t.id != id)
  saveTasks(allTasks)
  res.json({ msg: "deleted" })
})

app.listen(5000, () => console.log("server started on 5000"))
