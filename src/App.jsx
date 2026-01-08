import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from './components/Home';
import Reward from './components/Reward';
import Referral from './components/Referral';
import Tasks from './components/Tasks';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    
    tg.ready();
    tg.expand();
    const tgUser = tg.initDataUnsafe?.user;
    setUser(tgUser);
    const ADMIN_IDS = ['7787131118']; 
    if (tgUser && ADMIN_IDS.includes(tgUser.id.toString())) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} user={user} />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/admin" element={<AdminPanel isAdmin={isAdmin} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
