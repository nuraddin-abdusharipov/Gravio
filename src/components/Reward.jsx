import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GravioLogo from '/gravio.png';

function Reward() {

  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };
  const goToReward = () => {
    navigate("/reward");
  };
  const gotoReferral = () => {
    navigate("/referral");
  };
  const goToTasks = () => {
    navigate("/tasks");
  };

  const [user, setUser] = useState(null);

  let count = 0;

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    const user = tg.initDataUnsafe?.user;
    setUser(user);
    const userid = user?.id.toString();
    const countRef = Number(userid);
    if (countRef <= 1000000) count = 20000;
    else if (countRef <= 10000000) count = 15000;
    else if (countRef <= 50000000) count = 10000;
    else count = 5000;
  }, []);

  setTimeout(() => {
    document.getElementById("cal").innerText = "Reward calculated!";
  }, 3200);
  setTimeout(() => {
    document.getElementById("cal").innerText = `Your reward is ${count} Gravio Tokens!`;
    localStorage.setItem("reward", count.toString());
  }, 4200);

  setTimeout(() => {
    document.getElementById("r1").style.background = "url('../public/checked.gif') no-repeat center";
  }, 3200)

  return (
    <div className="reward">
      <div className="reward-navbar">
        <h3>{user?.first_name || "Gravio User"}</h3>
        {user?.photo_url && <img src={user.photo_url} alt="User Avatar" className="home-avatar" /> || <div src={GravioLogo} alt="User Avatar" className="home-avatar" >G</div>}
      </div>
      <div className="reward-content">
        <div className="reward-calculating">
          <h4 id="cal">Reward is calculating...</h4>
        </div>
        <div id="r1" className="reward-checked">
        </div>
      </div>
      <div className="reward-footer">
        <button onClick={goToHome}><i class="fa-solid fa-home"></i>Home</button>
        <button onClick={goToReward} className="dodgerblue"><i class="fa-solid fa-gift"></i>Reward</button>
        <button onClick={gotoReferral}><i class="fa-solid fa-user"></i>Referral</button>
        <button onClick={goToTasks}><i class="fa-solid fa-list"></i>Tasks</button>
      </div>
    </div>
  )
  
}

export default Reward;