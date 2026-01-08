import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  orderBy,
  startAfter,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";

function AdminPanel({ isAdmin }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [lastUser, setLastUser] = useState(null);
  const [lastTask, setLastTask] = useState(null);

  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    reward: ""
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    fetchCounts();
    fetchUsers();
    fetchTasks();
  }, [isAdmin]);

  const fetchCounts = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const tasksSnap = await getDocs(collection(db, "tasks"));
    setUserCount(usersSnap.size);
    setTaskCount(tasksSnap.size);
  };

  const fetchUsers = async (loadMore = false) => {
    let q = query(
      collection(db, "users"),
      orderBy("balance", "desc"),
      limit(20)
    );

    if (loadMore && lastUser) {
      q = query(
        collection(db, "users"),
        orderBy("balance", "desc"),
        startAfter(lastUser),
        limit(20)
      );
    }

    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setUsers(prev => (loadMore ? [...prev, ...data] : data));
    setLastUser(snap.docs[snap.docs.length - 1]);
    setHasMoreUsers(data.length === 20);
  };

  const saveUserBalance = async () => {
    await updateDoc(doc(db, "users", editingUser.id), {
      balance: Number(editingUser.balance)
    });
    setEditingUser(null);
    fetchUsers();
  };

  const deleteUser = async id => {
    if (!window.confirm("Delete user?")) return;
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
    fetchCounts();
  };

  const fetchTasks = async (loadMore = false) => {
    let q = query(
      collection(db, "tasks"),
      orderBy("reward", "desc"),
      limit(20)
    );

    if (loadMore && lastTask) {
      q = query(
        collection(db, "tasks"),
        orderBy("reward", "desc"),
        startAfter(lastTask),
        limit(20)
      );
    }

    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setTasks(prev => (loadMore ? [...prev, ...data] : data));
    setLastTask(snap.docs[snap.docs.length - 1]);
    setHasMoreTasks(data.length === 20);
  };

  const addTask = async () => {
    if (!newTask.name || !newTask.reward) return;

    await addDoc(collection(db, "tasks"), {
      name: newTask.name,
      reward: Number(newTask.reward),
      channel: newTask.channel,
      createdAt: new Date()
    });

    setNewTask({ name: "", reward: "", channel: "" });
    fetchTasks();
    fetchCounts();
  };

  const deleteTask = async id => {
    if (!window.confirm("Delete task?")) return;
    await deleteDoc(doc(db, "tasks", id));
    fetchTasks();
    fetchCounts();
  };

  return (
    <div className="admin-panel">
      <div className="admin-navbar">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h3>Admin Panel</h3>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users ({userCount})
        </button>
        <button
          className={`admin-tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks ({taskCount})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "users" && (
          <>
            <input
              className="search-input"
              placeholder="Search user..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Balance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u =>
                      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(u => (
                      <tr key={u.id}>
                        <td>{u.username || "User"}</td>
                        <td>
                          {editingUser?.id === u.id ? (
                            <input
                              className="edit-input"
                              type="number"
                              value={editingUser.balance}
                              onChange={e =>
                                setEditingUser({
                                  ...editingUser,
                                  balance: e.target.value
                                })
                              }
                            />
                          ) : (
                            u.balance
                          )}
                        </td>
                        <td className="actions">
                          {editingUser?.id === u.id ? (
                            <>
                              <button className="save-btn" onClick={saveUserBalance}>Save</button>
                              <button className="cancel-btn" onClick={() => setEditingUser(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="edit-btn" onClick={() => setEditingUser(u)}>Edit</button>
                              <button className="delete-btn" onClick={() => deleteUser(u.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {hasMoreUsers && (
              <button className="load-more" onClick={() => fetchUsers(true)}>
                Load more users
              </button>
            )}
          </>
        )}

        {activeTab === "tasks" && (
          <>
            <div className="add-task-form">
              <input
                className="form-input"
                type="text"
                placeholder="Task name"
                value={newTask.name}
                onChange={e => setNewTask({ ...newTask, name: e.target.value })}
              />
              <input
                className="form-input"
                type="number"
                placeholder="Reward"
                value={newTask.reward}
                onChange={e =>
                  setNewTask({ ...newTask, reward: e.target.value })
                }
              />
              <input
                className="form-input"
                type="text"
                placeholder="Url Channel Post"
                value={newTask.channel}
                onChange={e =>
                  setNewTask({ ...newTask, channel: e.target.value })
                }
              />
              <button className="add-btn" onClick={addTask}>
                Add Task
              </button>
            </div>

            <div className="table-container">
              <table className="tasks-table">
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.channel}</td>
                      <td>{t.reward}</td>
                      <td>
                        <button className="delete-btn" onClick={() => deleteTask(t.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMoreTasks && (
              <button className="load-more" onClick={() => fetchTasks(true)}>
                Load more tasks
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
