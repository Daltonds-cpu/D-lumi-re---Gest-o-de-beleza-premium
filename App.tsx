
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
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Agenda from './pages/Agenda';
import { Appointment } from './types';

// Shared Context for global state persistence
interface AppContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  clients: any[];
  clinicInfo: {
    name: string;
    tagline: string;
    logo: string | null;
  };
  updateClinicInfo: (info: { name: string; tagline: string; logo: string | null }) => void;
  setShowAbout: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
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
              <p className="text-sm font-bold text-[#0A0A0B]">1.0 <span className="text-gray-300 font-medium">|</span> 2026</p>
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
                  <span className="text-[10px] font-black uppercase tracking-widest">dani_mallet_lashdesigner</span>
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
  const { clinicInfo, setShowAbout } = useApp();
  
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
        <div className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-[#C5A059] cursor-pointer transition-colors group">
          <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-medium text-sm">Configurações</span>
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
  const { setShowAbout } = useApp();
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
  const { clinicInfo } = useApp();
  const location = useLocation();
  const getTitle = () => {
    switch(location.pathname) {
      case '/': return 'Painel Executivo';
      case '/clients': return 'Gestão de Clientes';
      case '/agenda': return 'Agenda Lumière';
      default: return clinicInfo.name;
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-[#F5F5F7]/80 backdrop-blur-xl z-40 px-6 lg:px-10 flex items-center justify-between border-b border-gray-200/50">
      <div className="flex flex-col">
        <h2 className="text-lg lg:text-xl font-playfair font-semibold text-[#0A0A0B] leading-tight tracking-tight">{getTitle()}</h2>
        <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-widest font-medium mt-0.5">24 de Outubro, 2024</p>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-8">
        <button className="relative text-gray-400 hover:text-[#C5A059] transition-colors p-2 bg-white rounded-full shadow-sm border border-gray-100">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#C5A059] rounded-full border-2 border-[#F5F5F7]"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 lg:pl-8 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wide">Gabrielle C.</p>
            <p className="text-[9px] text-[#C5A059] font-semibold uppercase tracking-widest">Premium Partner</p>
          </div>
          <div className="w-10 h-10 rounded-full black-piano border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-playfair text-lg shadow-inner">
            G
          </div>
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('lumiere_appointments');
    return saved ? JSON.parse(saved) : [
      { id: '1', clientId: '1', clientName: 'Helena Roitman', date: '2024-10-24', time: '14:00', service: 'Limpeza de Pele Diamond', status: 'scheduled' },
      { id: '2', clientId: '2', clientName: 'Beatriz Segall', date: '2024-10-24', time: '15:30', service: 'Microagulhamento', status: 'scheduled' },
      { id: '3', clientId: '3', clientName: 'Clara Nunes', date: '2024-10-24', time: '17:00', service: 'Drenagem Linfática', status: 'scheduled' },
    ];
  });

  const [clinicInfo, setClinicInfo] = useState(() => {
    const saved = localStorage.getItem('lumiere_clinic_info');
    return saved ? JSON.parse(saved) : {
      name: 'LUMIÈRE',
      tagline: 'Esthétique de Luxe',
      logo: null
    };
  });

  const [showAbout, setShowAbout] = useState(false);

  const clients = [
    { id: '1', name: 'Marina R. Barbosa', phone: '(11) 98765-4321', instagram: '@marinaruybarbosa', email: 'marina@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=11' },
    { id: '2', name: 'Gisele Bündchen', phone: '(11) 91234-5678', instagram: '@gisele', email: 'gisele@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=12' },
    { id: '3', name: 'Anitta Machado', phone: '(21) 99988-7766', instagram: '@anitta', email: 'anitta@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=13' },
    { id: '4', name: 'Bruna Marquezine', phone: '(21) 97766-5544', instagram: '@brunamarquezine', email: 'bruna@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=14' },
    { id: '5', name: 'Helena Roitman', phone: '(11) 92222-3333', instagram: '@helena', email: 'helena@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=1' },
    { id: '6', name: 'Beatriz Segall', phone: '(11) 94444-5555', instagram: '@beatriz', email: 'beatriz@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=2' },
    { id: '7', name: 'Clara Nunes', phone: '(11) 96666-7777', instagram: '@clara', email: 'clara@gmail.com', photoUrl: 'https://picsum.photos/200/200?random=3' },
  ];

  useEffect(() => {
    localStorage.setItem('lumiere_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('lumiere_clinic_info', JSON.stringify(clinicInfo));
  }, [clinicInfo]);

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const updateClinicInfo = (info: any) => {
    setClinicInfo(info);
  };

  return (
    <AppContext.Provider value={{ 
      appointments, 
      addAppointment, 
      clients, 
      clinicInfo, 
      updateClinicInfo, 
      setShowAbout 
    }}>
      <HashRouter>
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col lg:flex-row">
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
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
