
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  LayoutDashboard, 
  Bell,
  Info,
  Download,
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard.tsx';
import Clients from './pages/Clients.tsx';
import Agenda from './pages/Agenda.tsx';
import { Appointment, Reminder, Client } from './types.ts';
import { db } from './firebase.ts';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const GOOGLE_CLIENT_ID = "262684864293-gc2uavphil9uv1mnb1hqi4q17m02k3rt.apps.googleusercontent.com";

interface GoogleUser {
  name: string;
  picture: string;
  email: string;
}

interface AppContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  clients: Client[];
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  clinicInfo: { name: string; tagline: string; logo: string | null };
  updateClinicInfo: (info: { name: string; tagline: string; logo: string | null }) => Promise<void>;
  setShowAbout: (show: boolean) => void;
  deferredPrompt: any;
  handleInstallClick: () => void;
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  user: GoogleUser | null;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const LoginScreen: React.FC<{ onLoginSuccess: (response: any) => void }> = ({ onLoginSuccess }) => {
  useEffect(() => {
    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: onLoginSuccess,
          auto_select: false,
          cancel_on_tap_outside: false
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("btn-login-google-splash"),
          { 
            theme: "outline", 
            size: "large", 
            shape: "pill", 
            text: "continue_with", 
            width: 280,
            logo_alignment: "left"
          }
        );
        return true;
      }
      return false;
    };

    if (!initGoogle()) {
      const interval = setInterval(() => {
        if (initGoogle()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [onLoginSuccess]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center black-piano overflow-hidden">
      <div className="absolute inset-0 iridescent-bg opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/10 blur-[150px] rounded-full"></div>
      
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2 }} className="relative z-10 text-center space-y-10 px-6">
        <div className="space-y-4">
          <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 3 }}>
            <Sparkles className="text-[#C5A059] w-12 h-12 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-playfair font-bold text-[#C5A059] tracking-[0.2em] uppercase">D'LUMIÈRE</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.6em] font-black">Gestão de Excelência</p>
        </div>
        <div className="pt-8 flex flex-col items-center gap-6">
          <div id="btn-login-google-splash" className="min-h-[50px] transition-transform hover:scale-105"></div>
          <p className="text-[10px] text-gray-600 font-medium tracking-widest italic">"A beleza é o esplendor da verdade"</p>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('lumiere_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clinicInfo, setClinicInfo] = useState({ name: 'D.LUMIÈRE', tagline: 'Esthétique de Luxe', logo: null });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.email);

    const unsubClients = onSnapshot(collection(userDocRef, "clients"), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    });
    const unsubAppointments = onSnapshot(collection(userDocRef, "appointments"), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });
    const unsubReminders = onSnapshot(collection(userDocRef, "reminders"), (snap) => {
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reminder)));
    });
    const unsubClinic = onSnapshot(doc(userDocRef, "config", "clinicInfo"), (d) => {
      if (d.exists()) setClinicInfo(d.data() as any);
    });

    return () => { unsubClients(); unsubAppointments(); unsubReminders(); unsubClinic(); };
  }, [user]);

  const handleCredentialResponse = (response: any) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const profile = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
      const userData = { name: profile.name, picture: profile.picture, email: profile.email };
      setUser(userData);
      localStorage.setItem('lumiere_user', JSON.stringify(userData));
    } catch (e) {
      console.error("Erro ao decodificar login:", e);
    }
  };

  const logout = () => {
    localStorage.removeItem('lumiere_user');
    setUser(null);
    window.location.reload();
  };

  const addClient = async (client: Client) => {
    if (!user) return;
    try {
      const { id, ...data } = client;
      await setDoc(doc(db, "users", user.email, "clients", id), data);
    } catch (e) { alert("Erro ao salvar cliente: " + (e as Error).message); }
  };

  const updateClient = async (client: Client) => {
    if (!user) return;
    try {
      const { id, ...data } = client;
      await updateDoc(doc(db, "users", user.email, "clients", id), data);
    } catch (e) { alert("Erro ao atualizar: " + (e as Error).message); }
  };

  const addAppointment = async (appointment: Appointment) => {
    if (!user) return;
    try {
      const { id, ...data } = appointment;
      await setDoc(doc(db, "users", user.email, "appointments", id), data);
    } catch (e) { alert("Erro ao agendar: " + (e as Error).message); }
  };

  const updateAppointment = async (app: Appointment) => {
    if (!user) return;
    try {
      const { id, ...data } = app;
      await updateDoc(doc(db, "users", user.email, "appointments", id), data);
    } catch (e) { alert("Erro ao salvar dossiê: " + (e as Error).message); }
  };

  const addReminder = async (rem: Reminder) => {
    if (!user) return;
    try {
      const { id, ...data } = rem;
      await setDoc(doc(db, "users", user.email, "reminders", id), data);
    } catch (e) { alert("Erro ao criar lembrete: " + (e as Error).message); }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    try { await deleteDoc(doc(db, "users", user.email, "reminders", id)); } catch (e) { console.error(e); }
  };

  const updateClinicInfo = async (info: any) => {
    if (!user) return;
    try { await setDoc(doc(db, "users", user.email, "config", "clinicInfo"), info); } catch (e) { alert("Erro ao salvar marca: " + (e as Error).message); }
  };

  const handleInstallClick = () => alert("Para instalar, use a opção 'Adicionar à tela de início' do seu navegador.");

  return (
    <AppContext.Provider value={{ 
      appointments, addAppointment, updateAppointment,
      clients, addClient, updateClient,
      clinicInfo, updateClinicInfo, 
      setShowAbout, deferredPrompt, handleInstallClick,
      reminders, addReminder, deleteReminder,
      user, logout
    }}>
      <HashRouter>
        <AnimatePresence mode="wait">
          {!user ? (
            <LoginScreen key="login" onLoginSuccess={handleCredentialResponse} />
          ) : (
            <div className="flex flex-col lg:flex-row min-h-screen">
              <Sidebar />
              <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
                <Header />
                <div className="mt-20 px-4 py-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/agenda" element={<Agenda />} />
                  </Routes>
                </div>
              </main>
              <BottomNav />
            </div>
          )}
        </AnimatePresence>
      </HashRouter>
    </AppContext.Provider>
  );
};

const Sidebar = () => {
  const { clinicInfo } = useApp();
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 black-piano text-white flex-col border-r border-[#C5A059]/10 z-50">
      <div className="p-8">
        <h1 className="text-2xl font-playfair font-bold text-[#C5A059] uppercase tracking-widest">{clinicInfo.name}</h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{clinicInfo.tagline}</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink to="/" className={({isActive}) => `flex items-center gap-3 p-4 rounded-2xl transition-all ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
        </NavLink>
        <NavLink to="/agenda" className={({isActive}) => `flex items-center gap-3 p-4 rounded-2xl transition-all ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Calendar size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Agenda</span>
        </NavLink>
        <NavLink to="/clients" className={({isActive}) => `flex items-center gap-3 p-4 rounded-2xl transition-all ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Users size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Clientes</span>
        </NavLink>
      </nav>
    </aside>
  );
};

const Header = () => {
  const { user, logout } = useApp();
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-white/80 backdrop-blur-md z-40 px-6 flex items-center justify-between border-b border-gray-100">
      <h2 className="font-playfair font-bold text-[#0A0A0B] uppercase tracking-widest">Lumière</h2>
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0B]">{user.name}</p>
            <button onClick={logout} className="text-[9px] text-red-400 font-bold uppercase tracking-widest hover:text-red-600 transition-colors">Sair da Conta</button>
          </div>
          <img src={user.picture} className="w-10 h-10 rounded-full border border-[#C5A059] shadow-sm" alt={user.name} />
          <button onClick={logout} className="sm:hidden text-red-400 p-2"><LogOut size={18}/></button>
        </div>
      )}
    </header>
  );
};

const BottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 black-piano h-20 flex items-center justify-around z-50 border-t border-[#C5A059]/20 px-4">
    <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#C5A059]' : 'text-gray-600'}`}>
      <LayoutDashboard size={22} /> <span className="text-[9px] font-bold uppercase tracking-widest">Início</span>
    </NavLink>
    <NavLink to="/agenda" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#C5A059]' : 'text-gray-600'}`}>
      <Calendar size={22} /> <span className="text-[9px] font-bold uppercase tracking-widest">Agenda</span>
    </NavLink>
    <NavLink to="/clients" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-[#C5A059]' : 'text-gray-600'}`}>
      <Users size={22} /> <span className="text-[9px] font-bold uppercase tracking-widest">Clientes</span>
    </NavLink>
  </nav>
);

export default App;
