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
  startAfter,
  orderBy,
  addDoc,
  getDoc,
  setDoc,
  where,
  startAt,
  endAt
} from "firebase/firestore";
import { db } from "../firebase";

function AdminPanel({ isAdmin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lastUser, setLastUser] = useState(null);
  const [lastTask, setLastTask] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', description: '', reward: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    fetchCounts();
    fetchUsers();
    fetchTasks();
  }, [isAdmin, navigate]);

  const fetchCounts = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const tasksSnap = await getDocs(collection(db, "tasks"));
      setUserCount(usersSnap.size);
      setTaskCount(tasksSnap.size);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const itemsPerPage = 20;
      const q = query(
        collection(db, "users"),
        orderBy("balance", "desc"),
        limit(itemsPerPage * page)
      );
      
      const querySnapshot = await getDocs(q);
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      
      setUsers(usersData);
      setHasMoreUsers(usersData.length >= itemsPerPage * page);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchTasks = async (page = 1) => {
    try {
      const itemsPerPage = 20;
      const q = query(
        collection(db, "tasks"),
        orderBy("reward", "desc"),
        limit(itemsPerPage * page)
      );
      
      const querySnapshot = await getDocs(q);
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      
      setTasks(tasksData);
      setHasMoreTasks(tasksData.length >= itemsPerPage * page);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleEditUser = async (userId, newData) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, newData);
      alert("User updated successfully!");
      fetchUsers(userPage);
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert("User deleted successfully!");
        fetchUsers(userPage);
        fetchCounts();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error deleting user");
      }
    }
  };

  const handleAddTask = async () => {
    if (!newTask.name || !newTask.description || newTask.reward <= 0) {
      alert("Please fill all fields correctly!");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        name: newTask.name,
        description: newTask.description,
        reward: Number(newTask.reward),
        createdAt: new Date()
      });
      
      alert("Task added successfully!");
      setNewTask({ name: '', description: '', reward: 0 });
      fetchTasks(taskPage);
      fetchCounts();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Error adding task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        alert("Task deleted successfully!");
        fetchTasks(taskPage);
        fetchCounts();
      } catch (err) {
        console.error("Error deleting task:", err);
        alert("Error deleting task");
      }
    }
  };

  const loadMoreUsers = () => {
    const nextPage = userPage + 1;
    setUserPage(nextPage);
    fetchUsers(nextPage);
  };

  const loadMoreTasks = () => {
    const nextPage = taskPage + 1;
    setTaskPage(nextPage);
    fetchTasks(nextPage);
  };

  const goToHome = () => navigate('/');
  const goToReward = () => navigate('/reward');
  const goToReferral = () => navigate('/referral');
  const goToTasks = () => navigate('/tasks');

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="admin-navbar">
          <h3>Access Denied</h3>
        </div>
        <div className="admin-content">
          <p>You don't have permission to access this page.</p>
          <button onClick={() => navigate('/')} className="home-btn">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-navbar">
        <button onClick={() => navigate('/')} className="back-btn">
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h3>Admin Panel</h3>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({userCount})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks ({taskCount})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => 
                      !searchTerm || 
                      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.id?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                    <tr key={user.id}>
                      <td title={user.id}>{user.id.substring(0, 8)}...</td>
                      <td>{user.username || 'N/A'}</td>
                      <td>{user.firstname}</td>
                      <td>
                        {editingUser?.id === user.id ? (
                          <input
                            type="number"
                            value={editingUser.balance}
                            onChange={(e) => setEditingUser({
                              ...editingUser,
                              balance: e.target.value
                            })}
                            className="edit-input"
                          />
                        ) : (
                          user.balance
                        )}
                      </td>
                      <td className="actions">
                        {editingUser?.id === user.id ? (
                          <>
                            <button 
                              onClick={() => handleEditUser(user.id, { balance: Number(editingUser.balance) })}
                              className="save-btn"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingUser(null)}
                              className="cancel-btn"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditingUser(user)}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {hasMoreUsers && (
              <button onClick={loadMoreUsers} className="load-more">
                Load More Users
              </button>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <div className="add-task-form">
              <h4>Add New Task</h4>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Task Name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Task Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Reward Amount"
                  value={newTask.reward}
                  onChange={(e) => setNewTask({...newTask, reward: e.target.value})}
                  className="form-input"
                  min="1"
                />
              </div>
              <button onClick={handleAddTask} className="add-btn">
                <i className="fa-solid fa-plus"></i> Add Task
              </button>
            </div>

            <div className="table-container">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Reward</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td className="task-desc-cell">{task.description}</td>
                      <td>{task.reward}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="delete-btn"
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {hasMoreTasks && (
              <button onClick={loadMoreTasks} className="load-more">
                Load More Tasks
              </button>
            )}
          </div>
        )}
      </div>

      <div className="admin-footer">
        <button onClick={goToHome}><i className="fa-solid fa-home"></i> Home</button>
        <button onClick={goToReward}><i className="fa-solid fa-gift"></i> Reward</button>
        <button onClick={goToReferral}><i className="fa-solid fa-user"></i> Referral</button>
        <button onClick={goToTasks}><i className="fa-solid fa-list"></i> Tasks</button>
      </div>
    </div>
  );
}

export default AdminPanel;