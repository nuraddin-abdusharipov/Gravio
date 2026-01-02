import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter
} from "firebase/firestore";
import { db } from "../firebase";

function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    reward: ""
  });

  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [lastUserDoc, setLastUserDoc] = useState(null);
  const USERS_LIMIT = 20;

  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const q = query(
        collection(db, "tasks"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(q);
      setTasks(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    } catch (e) {
      console.error(e);
    }
    setTaskLoading(false);
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(USERS_LIMIT)
      );

      const snap = await getDocs(q);

      setUsers(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );

      setLastUserDoc(snap.docs[snap.docs.length - 1] || null);
    } catch (e) {
      console.error(e);
    }
    setUserLoading(false);
  };

  const loadMoreUsers = async () => {
    if (!lastUserDoc) return;

    setUserLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        startAfter(lastUserDoc),
        limit(USERS_LIMIT)
      );

      const snap = await getDocs(q);

      const newUsers = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setUsers(prev => [...prev, ...newUsers]);
      setLastUserDoc(snap.docs[snap.docs.length - 1] || null);
    } catch (e) {
      console.error(e);
    }
    setUserLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.name || !newTask.description || !newTask.reward) {
      alert("Fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        name: newTask.name,
        description: newTask.description,
        reward: Number(newTask.reward),
        createdAt: new Date()
      });

      setNewTask({ name: "", description: "", reward: "" });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Admin Panel</h2>

      <div className="admin-add-task">
        <h3>Add Task</h3>

        <input
          type="text"
          placeholder="Task name"
          value={newTask.name}
          onChange={e =>
            setNewTask({ ...newTask, name: e.target.value })
          }
        />

        <textarea
          placeholder="Task description"
          value={newTask.description}
          onChange={e =>
            setNewTask({ ...newTask, description: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Reward"
          value={newTask.reward}
          onChange={e =>
            setNewTask({ ...newTask, reward: e.target.value })
          }
        />

        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <div className="admin-task-list">
        <h3>Tasks</h3>

        {taskLoading && <p>Loading...</p>}

        {!taskLoading &&
          tasks.map(task => (
            <div className="admin-task-item" key={task.id}>
              <div>
                <strong>{task.name}</strong>
                <p>{task.description}</p>
                <span>Reward: {task.reward}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          ))}
      </div>

      <div className="admin-users">
        <h3>Users</h3>

        {users.map(user => (
          <div className="admin-user-item" key={user.id}>
            <span>ID: {user.id}</span>
            <span>Username: {user.username || "-"}</span>
            <span>Balance: {user.balance || 0}</span>
          </div>
        ))}

        {userLoading && <p>Loading...</p>}

        {!userLoading && lastUserDoc && (
          <button onClick={loadMoreUsers}>
            Load more
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
