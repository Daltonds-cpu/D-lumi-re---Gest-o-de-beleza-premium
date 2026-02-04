
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  Bell,
  Menu,
  X,
  Edit2,
  Info,
  Instagram,
  ExternalLink,
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
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';

// CONFIGURAÇÃO DO GOOGLE CLIENT ID FORNECIDO PELO USUÁRIO
const GOOGLE_CLIENT_ID = "262684864293-gc2uavphil9uv1mnb1hqi4q17m02k3rt.apps.googleusercontent.com";

interface GoogleUser {
  name: string;
  picture: string;
}

// Shared Context for global state persistence
interface AppContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  clients: Client[];
  clinicInfo: {
    name: string;
    tagline: string;
    logo: string | null;
  };
  updateClinicInfo: (info: { name: string; tagline: string; logo: string | null }) => void;
  setShowAbout: (show: boolean) => void;
  deferredPrompt: any;
  handleInstallClick: () => void;
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  user: GoogleUser | null;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// Componente de Tela de Bloqueio (Splash Screen)
const LoginScreen: React.FC<{ onLoginSuccess: (response: any) => void }> = ({ onLoginSuccess }) => {
  useEffect(() => {
    if ((window as any).google) {
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
    }
  }, [onLoginSuccess]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center black-piano overflow-hidden"
    >
      <div className="absolute inset-0 iridescent-bg opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/10 blur-[150px] rounded-full"></div>
      
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 text-center space-y-10 px-6"
      >
        <div className="space-y-4">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="flex justify-center mb-8"
          >
            <div className="p-5 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/5 backdrop-blur-sm">
              <Sparkles className="text-[#C5A059] w-12 h-12" />
            </div>
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-playfair font-bold text-[#C5A059] tracking-[0.2em] uppercase">D'LUMIÈRE</h1>
          <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-[0.6em] font-black pl-2">Gestão de Excelência</p>
        </div>

        <div className="pt-12 flex flex-col items-center gap-8">
          <div id="btn-login-google-splash" className="min-h-[50px] transition-transform hover:scale-105 active:scale-95"></div>
          <div className="space-y-2">
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold">Acesso Restrito</p>
            <p className="text-[10px] text-gray-600 font-medium max-w-[250px] leading-relaxed italic">
              "A beleza é o esplendor da verdade."
            </p>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-12 left-0 right-0 text-center">
         <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Esthétique de Luxe &copy; 2026</p>
      </div>
    </motion.div>
  );
};

const AboutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm glass-card rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
        >
          <div className="black-piano p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 iridescent-bg opacity-10"></div>
            <h2 className="text-3xl font-playfair font-bold text-[#C5A059] tracking-widest relative z-10">D'LUMIÈRE</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-2 font-bold relative z-10">Management Excellence</p>
          </div>
          
          <div className="p-8 space-y-8 text-center">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Versão Atual</p>
              <p className="text-sm font-bold text-[#0A0A0B]">1.2.5 <span className="text-gray-300 font-medium">|</span> 2026</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desenvolvido por</p>
              <p className="text-sm font-playfair font-bold text-[#0A0A0B]">Dalton D. & Daniele M.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Social & Contato</p>
              <div className="flex justify-center gap-4">
                <a 
                  href="https://instagram.com/dani_mallet_lashdesigner" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 hover:bg-[#C5A059]/10 text-gray-600 hover:text-[#C5A059] transition-all border border-gray-100"
                >
                  <Instagram size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                </a>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl black-piano text-[#C5A059] text-[10px] font-black uppercase tracking-widest shadow-xl btn-3d border border-[#C5A059]/20"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Sidebar = () => {
  const { clinicInfo, setShowAbout, handleInstallClick } = useApp();
  
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 black-piano text-white flex-col z-50 border-r border-[#C5A059]/10">
      <div className="p-8">
        <h1 className="text-3xl font-playfair tracking-widest text-[#C5A059] font-bold uppercase truncate">{clinicInfo.name}</h1>
        <p className="text-[10px] tracking-[0.2em] text-[#C5A059]/60 uppercase mt-1 truncate">{clinicInfo.tagline}</p>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm tracking-wide">Dashboard</span>
        </NavLink>
        <NavLink 
          to="/agenda" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Calendar size={20} />
          <span className="font-medium text-sm tracking-wide">Agenda</span>
        </NavLink>
        <NavLink 
          to="/clients" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Users size={20} />
          <span className="font-medium text-sm tracking-wide">Clientes</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <div 
          onClick={handleInstallClick}
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-[#C5A059] cursor-pointer transition-colors group rounded-xl"
        >
          <Download size={20} className="group-hover:translate-y-1 transition-transform duration-500" />
          <span className="font-medium text-sm">Baixar App</span>
        </div>
        <div 
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-[#C5A059] cursor-pointer transition-colors group"
        >
          <Info size={20} className="group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium text-sm">Sobre</span>
        </div>
      </div>
    </aside>
  );
};

const BottomNav = () => {
  const { setShowAbout, handleInstallClick } = useApp();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 black-piano border-t border-[#C5A059]/20 h-20 flex items-center justify-around px-4 z-50">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#C5A059]' : 'text-gray-600'}`}
      >
        <LayoutDashboard size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Início</span>
      </NavLink>
      <NavLink 
        to="/agenda" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#C5A059]' : 'text-gray-600'}`}
      >
        <Calendar size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Agenda</span>
      </NavLink>
      <NavLink 
        to="/clients" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#C5A059]' : 'text-gray-600'}`}
      >
        <Users size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Clientes</span>
      </NavLink>
      <div 
        onClick={handleInstallClick}
        className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#C5A059] cursor-pointer"
      >
        <Download size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Baixar</span>
      </div>
      <div 
        onClick={() => setShowAbout(true)}
        className="flex flex-col items-center gap-1 text-gray-600 cursor-pointer"
      >
        <Info size={22} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Sobre</span>
      </div>
    </nav>
  );
};

const Header = () => {
  const { clinicInfo, user, logout } = useApp();
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTitle = () => {
    switch(location.pathname) {
      case '/': return 'Painel Executivo';
      case '/clients': return 'Gestão de Clientes';
      case '/agenda': return 'Agenda D.Lumière';
      default: return clinicInfo.name;
    }
  };

  const formatDate = (date: Date) => {
    const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${d} | ${t}`;
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-[#F5F5F7]/80 backdrop-blur-xl z-40 px-6 lg:px-10 flex items-center justify-between border-b border-gray-200/50">
      <div className="flex flex-col">
        <h2 className="text-lg lg:text-xl font-playfair font-semibold text-[#0A0A0B] leading-tight tracking-tight">{getTitle()}</h2>
        <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-medium mt-0.5">{formatDate(now)}</p>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-8">
        <button className="relative text-gray-400 hover:text-[#C5A059] transition-colors p-2 bg-white rounded-full shadow-sm border border-gray-100">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#C5A059] rounded-full border-2 border-[#F5F5F7]"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-4 lg:pl-8 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wide truncate max-w-[150px]">{user.name}</p>
              <button 
                onClick={logout}
                className="text-[9px] text-red-400 font-semibold uppercase tracking-widest flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                <LogOut size={8} /> Sair
              </button>
            </div>
            <img 
              src={user.picture} 
              className="w-10 h-10 rounded-full border border-[#C5A059]/40 shadow-inner object-cover" 
              alt={user.name} 
            />
          </div>
        )}
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clinicInfo, setClinicInfo] = useState({ name: 'D.LUMIÈRE', tagline: 'Esthétique de Luxe', logo: null });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Persistência de usuário logado
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('lumiere_user');
    return saved ? JSON.parse(saved) : null;
  });

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleCredentialResponse = (response: any) => {
    const profile = parseJwt(response.credential);
    if (profile) {
      const userData = {
        name: profile.name,
        picture: profile.picture
      };
      setUser(userData);
      localStorage.setItem('lumiere_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    localStorage.removeItem('lumiere_user');
    setUser(null);
    window.location.reload();
  };

  // Firestore Real-time Listeners
  useEffect(() => {
    if (!user) return; // Só ouve se estiver logado

    const unsubAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });

    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      if (!snapshot.empty) {
        setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
      }
    });

    const unsubReminders = onSnapshot(collection(db, "reminders"), (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    });

    const unsubClinic = onSnapshot(doc(db, "settings", "clinicInfo"), (docSnap) => {
      if (docSnap.exists()) {
        setClinicInfo(docSnap.data() as any);
      }
    });

    return () => {
      unsubAppointments();
      unsubClients();
      unsubReminders();
      unsubClinic();
    };
  }, [user]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Para instalar D'Lumière:\n\nNo iPhone (iOS): Toque em 'Compartilhar' e selecione 'Adicionar à Tela de Início'.\n\nNo Android ou Desktop: Procure a opção 'Instalar Aplicativo' no menu do navegador.");
    }
  };

  const addAppointment = async (appointment: Appointment) => {
    await addDoc(collection(db, "appointments"), appointment);
  };

  const updateAppointment = async (appointment: Appointment) => {
    const { id, ...data } = appointment;
    await updateDoc(doc(db, "appointments", id), data);
  };

  const updateClinicInfo = async (info: any) => {
    await setDoc(doc(db, "settings", "clinicInfo"), info);
  };

  const addReminder = async (reminder: Reminder) => {
    await addDoc(collection(db, "reminders"), reminder);
  };

  const deleteReminder = async (id: string) => {
    await deleteDoc(doc(db, "reminders", id));
  };

  return (
    <AppContext.Provider value={{ 
      appointments, 
      addAppointment, 
      updateAppointment,
      clients, 
      clinicInfo, 
      updateClinicInfo, 
      setShowAbout,
      deferredPrompt,
      handleInstallClick,
      reminders,
      addReminder,
      deleteReminder,
      user,
      logout
    }}>
      <HashRouter>
        <div className="min-h-screen bg-[#F5F5F7]">
          <AnimatePresence mode="wait">
            {!user ? (
              <LoginScreen key="login" onLoginSuccess={handleCredentialResponse} />
            ) : (
              <motion.div 
                key="app" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.8 }}
                className="flex flex-col lg:flex-row min-h-screen"
              >
                <Sidebar />
                <main className="flex-1 lg:ml-64 min-h-screen pb-24 lg:pb-12">
                  <Header />
                  <div className="mt-20 px-4 lg:px-10 py-6 lg:py-10">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/agenda" element={<Agenda />} />
                    </Routes>
                  </div>
                </main>
                <BottomNav />
                <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
