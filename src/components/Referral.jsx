import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GravioLogo from '/gravio.png';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function Reward() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [referralUsers, setReferralUsers] = useState([]);

  const goToHome = () => navigate("/");
  const goToReward = () => navigate("/reward");
  const gotoReferral = () => navigate("/referral");
  const goToTasks = () => navigate("/tasks");

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    const tgUser = tg.initDataUnsafe?.user;
    setUser(tgUser);

    if (!tgUser) return;

    const fetchReferrals = async () => {
      try {
        const q = query(collection(db, "referral"), where("by", "==", tgUser.id));
        const querySnap = await getDocs(q);

        const referrals = [];

        for (const docSnap of querySnap.docs) {
          const refId = docSnap.data().id;

          const userDoc = await getDoc(doc(db, "users", refId));
          if (userDoc.exists()) {
            const refUserData = userDoc.data();
            referrals.push({
              id: refId,
              username: refUserData.username,
              balance: refUserData.balance
            });
          }
        }

        setReferralUsers(referrals);

      } catch (err) {
        console.error("Error fetching referrals:", err);
      }
    };

    fetchReferrals();

  }, []);

  const copy = () => {
    if (!user) return;
    const copyText = `https://t.me/GravioToken_bot?start=${user.id}`;
    navigator.clipboard.writeText(copyText);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="referral">
      <div className="referral-navbar">
        <h3>{user?.first_name || "Gravio User"}</h3>
        <img src={user?.photo_url || GravioLogo} alt="User Avatar" className="home-avatar" />
      </div>

      <div className="referral-content">
        <input type="text" readOnly value={`https://t.me/GravioToken_bot?start=${user?.id}`} onClick={copy} />
        <button onClick={copy}>Copy</button>

        <div className="referral-users">
          {referralUsers.length === 0 ? (
            <p>No referrals yet</p>
          ) : (
            referralUsers.map((refUser) => (
              <div key={refUser.id} className="referrals">
                <div className="referrals-div"><span>Username: </span>{refUser.username}</div>
                <div className="referrals-div"><span>Balance: </span>{refUser.balance}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="referral-footer">
        <button onClick={goToHome}><i className="fa-solid fa-home"></i>Home</button>
        <button onClick={goToReward}><i className="fa-solid fa-gift"></i>Reward</button>
        <button onClick={gotoReferral} className="dodgerblue"><i className="fa-solid fa-user"></i>Referral</button>
        <button onClick={goToTasks}><i className="fa-solid fa-list"></i>Tasks</button>
      </div>
    </div>
  )
}

export default Reward;
