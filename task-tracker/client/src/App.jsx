import { useEffect, useState } from "react"

function App() {
  const [tasks, setTasks] = useState([])
  const [name, setName] = useState("")
  const [task, setTask] = useState("")
  const [week, setWeek] = useState("")
  const [priority, setPriority] = useState("medium")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [weekFilter, setWeekFilter] = useState("all")

  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editTask, setEditTask] = useState("")
  const [editWeek, setEditWeek] = useState("")
  const [editPriority, setEditPriority] = useState("")

  useEffect(() => {
    getTasks()
  }, [])

  function getTasks() {
    fetch("/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
  }

  function addTask(e) {
    e.preventDefault()

    if (!name || !task || !week) {
      alert("fill all fields")
      return
    }

    fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, task, week, priority })
    }).then(() => {
      getTasks()
      setName("")
      setTask("")
      setWeek("")
      setPriority("medium")
    })
  }

  function changeStatus(id, status) {
    fetch("/tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).then(() => getTasks())
  }

  function removeTask(id) {
    fetch("/tasks/" + id, { method: "DELETE" }).then(() => getTasks())
  }

  function openEdit(t) {
    setEditId(t.id)
    setEditName(t.name)
    setEditTask(t.task)
    setEditWeek(t.week)
    setEditPriority(t.priority)
  }

  function saveEdit(id) {
    fetch("/tasks/" + id + "/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, task: editTask, week: editWeek, priority: editPriority })
    }).then(() => {
      getTasks()
      setEditId(null)
    })
  }

  // filtering logic - probably could be cleaner but works
  let shown = tasks
  if (search.trim() != "") {
    shown = shown.filter(t => t.name.toLowerCase().indexOf(search.toLowerCase()) !== -1)
  }
  if (statusFilter != "all") {
    shown = shown.filter(t => t.status == statusFilter)
  }
  if (weekFilter != "all") {
    shown = shown.filter(t => t.week == weekFilter)
  }

  const doneCount = tasks.filter(t => t.status == "done").length
  const progressCount = tasks.filter(t => t.status == "in progress").length
  const pendingCount = tasks.filter(t => t.status == "pending").length
  const percent = tasks.length == 0 ? 0 : Math.round((doneCount / tasks.length) * 100)

  const weeks = []
  for (let t of tasks) {
    if (!weeks.includes(t.week)) weeks.push(t.week)
  }

  return (
    <div className="container">
      <h1>Weekly Task Tracker</h1>
      <p>SafeX Intern Candidate Management Portal</p>

      <div className="stats">
        <div className="statBox">
          <b>{tasks.length}</b>
          <span>Total</span>
        </div>
        <div className="statBox">
          <b>{pendingCount}</b>
          <span>Pending</span>
        </div>
        <div className="statBox">
          <b>{progressCount}</b>
          <span>In Progress</span>
        </div>
        <div className="statBox">
          <b>{doneCount}</b>
          <span>Done</span>
        </div>
      </div>

      <div className="progressOuter">
        <div className="progressInner" style={{ width: percent + "%" }}></div>
      </div>
      <p style={{ fontSize: "13px", color: "#666" }}>{percent}% completed</p>

      <form onSubmit={addTask}>
        <input placeholder="Candidate name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Task" value={task} onChange={e => setTask(e.target.value)} />
        <input placeholder="Week" type="number" value={week} onChange={e => setWeek(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <div className="filters">
        <input placeholder="Search candidate" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={weekFilter} onChange={e => setWeekFilter(e.target.value)}>
          <option value="all">All Weeks</option>
          {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {shown.map(t => (
        <div className="card" key={t.id}>
          {editId === t.id ? (
            <div>
              <input value={editName} onChange={e => setEditName(e.target.value)} />
              <input value={editTask} onChange={e => setEditTask(e.target.value)} />
              <input type="number" value={editWeek} onChange={e => setEditWeek(e.target.value)} />
              <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button onClick={() => saveEdit(t.id)}>Save</button>
              <button onClick={() => setEditId(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <div className="cardTop">
                <span className="tag">Week {t.week}</span>
                <span className={"tag prio-" + t.priority}>{t.priority}</span>
              </div>
              <h3>{t.task}</h3>
              <p className="candidateName">{t.name}</p>
              <select value={t.status} onChange={e => changeStatus(t.id, e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button onClick={() => openEdit(t)}>Edit</button>
              <button onClick={() => removeTask(t.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}

      {shown.length == 0 && <p>No tasks found</p>}
    </div>
  )
}

export default App
