import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import GravioLogo from "/gravio.png";

function Home({ isAdmin, user: propUser }) {
  const [balance, setBalance] = useState(0);
  const [localUser, setLocalUser] = useState(propUser);

  const navigate = useNavigate();

  const goToHome = () => navigate("/");
  const goToReward = () => navigate("/reward");
  const goToReferral = () => navigate("/referral");
  const goToTasks = () => navigate("/tasks");
  const goToAdmin = () => navigate("/admin");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();

    const telegramUser = tg.initDataUnsafe?.user || propUser;
    if (!telegramUser) return;

    setLocalUser(telegramUser);

    const userid = telegramUser.id.toString();

    let count = 0;
    const countRef = Number(userid);
    if (countRef <= 1000000) count = 200;
    else if (countRef <= 10000000) count = 150;
    else if (countRef <= 50000000) count = 100;
    else count = 50;

    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", userid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBalance(docSnap.data().balance);
        } else {
          await setDoc(docRef, {
            id: userid,
            balance: count,
            firstname: telegramUser.first_name || "User",
            lastname: telegramUser.last_name || "",
            username: telegramUser.username || ""
          });
          setBalance(count);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [propUser]);

  return (
    <div className="home">
      <div className="home-navbar">
        <h3>{localUser?.first_name || "Gravio User"}</h3>
        {localUser?.photo_url ? (
          <img
            src={localUser.photo_url}
            alt="User Avatar"
            className="home-avatar"
          />
        ) : (
          <img src={GravioLogo} alt="User Avatar" className="home-avatar" />
        )}
      </div>

      <div className="home-content">
        <div className="home-logo">
          <img src={GravioLogo} alt="Gravio Logo" />
        </div>
        <div className="home-balance">
          Balance: {balance || 0} <img src={GravioLogo} alt="Gravio Token" />
        </div>
        <a href="#" className="home-link">
          <i className="fa-solid fa-users"></i> Join our community
        </a>
        <button onClick={goToReward} className="home-link">
          <i className="fa-solid fa-gift"></i> Check your rewards
        </button>
        
        {isAdmin && (
          <button onClick={goToAdmin} className="home-link admin-btn">
            <i className="fa-solid fa-lock"></i> Admin Panel
          </button>
        )}
      </div>

      <div className="home-footer">
        <button onClick={goToHome} className="dodgerblue">
          <i className="fa-solid fa-home"></i> Home
        </button>
        <button onClick={goToReward}>
          <i className="fa-solid fa-gift"></i> Reward
        </button>
        <button onClick={goToReferral}>
          <i className="fa-solid fa-user"></i> Referral
        </button>
        <button onClick={goToTasks}>
          <i className="fa-solid fa-list"></i> Tasks
        </button>
      </div>
    </div>
  );
}

export default Home;