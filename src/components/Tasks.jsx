import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GravioLogo from '/gravio.png';
import { collection, getDocs, doc, updateDoc, increment, query, where } from "firebase/firestore";
import { db } from "../firebase";

function Tasks() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState(new Set());

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    const tgUser = tg.initDataUnsafe?.user;
    setUser(tgUser);

    if (!tgUser) return;

    const fetchTasks = async () => {
      try {
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const tasksData = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);

        const doneSnap = await getDocs(query(collection(db, "done"), where("by", "==", tgUser.id)));
        const doneIds = new Set(doneSnap.docs.map(doc => doc.data().taskId));
        setDoneTasks(doneIds);

      } catch (err) {
        console.error("Error fetching tasks or done tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  const completeTask = async (task) => {
    if (!user) return;

    try {
      const response = await fetch("https://gravio2.onrender.com/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, channel: task.channel, reward: task.reward })
      });

      const data = await response.json();

      if (!data.success || !data.subscribed) {
        alert(data.message || "You have not subscribed!");
        return;
      }

      const userRef = doc(db, "users", String(user.id));
      await updateDoc(userRef, { balance: increment(task.reward) });

      const doneRef = doc(collection(db, "done"));
      await setDoc(doneRef, {
        by: user.id,
        taskId: task.id,
        channel: task.channel,
        timestamp: new Date()
      });

      setDoneTasks(prev => new Set([...prev, task.id]));
      alert(`Success! ${task.reward} added to your balance.`);

    } catch (err) {
      console.error("Xatolik:", err);
      alert("⚠️ ERROR!");
    }
  };



  const goToHome = () => navigate("/");
  const goToReward = () => navigate("/reward");
  const gotoReferral = () => navigate("/referral");
  const goToTasks = () => navigate("/tasks");

  return (
    <div className="tasks">
      <div className="tasks-navbar">
        <h3>{user?.first_name || "Gravio User"}</h3>
        {user?.photo_url && <img src={user.photo_url} alt="User Avatar" className="home-avatar" /> || <div src={GravioLogo} alt="User Avatar" className="home-avatar" >G</div>}
      </div>

      <div className="tasks-content">
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks available</p>
          ) : (
            tasks.map(task => (
              !doneTasks.has(task.id) && (
                <div key={task.id} className="task-item">
                  <i class="fa-solid fa-list-check"></i>
                  <div className="font">
                    <p className="task-title">{task.name}</p>
                    <p className="tast-reward">+{task.reward}</p>
                  </div>
                  <button className="task-complete" onClick={() => completeTask(task)}>Check</button>
                </div>
              )
            ))
          )}

        </div>

        <div className="tasks-footer">
          <button onClick={goToHome}><i className="fa-solid fa-home"></i>Home</button>
          <button onClick={goToReward}><i className="fa-solid fa-gift"></i>Reward</button>
          <button onClick={gotoReferral}><i className="fa-solid fa-user"></i>Referral</button>
          <button onClick={goToTasks} className="dodgerblue"><i className="fa-solid fa-list"></i>Tasks</button>
        </div>
      </div>
      )
}

      export default Tasks;
