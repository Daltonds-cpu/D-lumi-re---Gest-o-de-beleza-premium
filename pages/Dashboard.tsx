
import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Plus,
  Search,
  X,
  User,
  ChevronDown,
  Activity,
  UserPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Edit3,
  Camera,
  Upload,
  Gift,
  Cake,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';

const DatePickerModal = ({ isOpen, onClose, onSelect, selectedDate }: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  }, [currentMonth]);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl shadow-2xl z-50 p-4 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 text-gray-400 hover:text-[#C5A059]"><ChevronLeft size={18}/></button>
        <h4 className="font-playfair font-bold text-sm uppercase tracking-widest text-[#0A0A0B]">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 text-gray-400 hover:text-[#C5A059]"><ChevronRight size={18}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <span key={d} className="text-[10px] font-bold text-gray-300">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: daysInMonth.firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth.days }).map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDate && new Date(selectedDate).getDate() === day && new Date(selectedDate).getMonth() === currentMonth.getMonth();
          return (
            <button 
              key={day} 
              onClick={() => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                onSelect(date.toISOString().split('T')[0]);
                onClose();
              }}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center mx-auto
                ${isSelected ? 'black-piano text-[#C5A059]' : 'text-gray-500 hover:bg-[#C5A059]/10'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const TimePickerModal = ({ isOpen, onClose, onSelect, selectedTime }: any) => {
  const times = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl shadow-2xl z-50 p-4 max-h-60 overflow-y-auto grid grid-cols-3 gap-2"
    >
      {times.map(t => (
        <button
          key={t}
          onClick={() => {
            onSelect(t);
            onClose();
          }}
          className={`py-2 rounded-lg text-xs font-bold transition-all border
            ${selectedTime === t ? 'black-piano text-[#C5A059] border-[#0A0A0B]' : 'bg-white text-gray-500 border-gray-100 hover:border-[#C5A059]/30'}
          `}
        >
          {t}
        </button>
      ))}
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, delay = 0, onClick }: any) => (
  <ScrollReveal delay={delay} className="w-full">
    <div 
      onClick={onClick}
      className={`glass-card p-6 rounded-[24px] premium-shadow transition-all active:scale-[0.97] group overflow-hidden relative ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 iridescent-bg opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000"></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-playfair font-bold text-[#0A0A0B]">{value}</h3>
        </div>
        <div className="p-3.5 rounded-2xl black-piano text-[#C5A059] shadow-lg">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-[10px] lg:text-xs text-[#C5A059] font-bold uppercase tracking-widest opacity-80">
        <TrendingUp size={12} className="mr-1.5" />
        <span>Performance Real</span>
      </div>
    </div>
  </ScrollReveal>
);

const UpcomingAppointment = ({ name, time, service, photoUrl, delay = 0 }: any) => (
  <ScrollReveal delay={delay} direction="right">
    <div className="flex items-center justify-between p-4 rounded-[20px] hover:bg-white/60 active:bg-white/40 transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-200/50">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="relative flex-shrink-0">
          <img src={photoUrl || "https://picsum.photos/200/200?random=default"} className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A059]/30 p-0.5 shadow-sm" alt={name} />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#C5A059] border-2 border-[#F5F5F7] rounded-full flex items-center justify-center">
             <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="truncate">
          <h4 className="font-bold text-sm text-[#0A0A0B] tracking-tight truncate">{name}</h4>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate mt-0.5">{service}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="text-sm font-black text-[#0A0A0B] tabular-nums">{time}</p>
        <p className="text-[9px] text-[#C5A059] uppercase tracking-[0.15em] font-black mt-0.5">Vip</p>
      </div>
    </div>
  </ScrollReveal>
);

const SuccessToast = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] black-piano text-[#C5A059] px-8 py-5 rounded-[24px] shadow-2xl border border-[#C5A059]/40 flex items-center gap-4"
  >
    <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-[#0A0A0B] shadow-lg">
      <Check size={18} strokeWidth={3} />
    </div>
    <span className="font-bold text-xs lg:text-sm uppercase tracking-widest">{message}</span>
  </motion.div>
);

const ClinicInfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { clinicInfo, updateClinicInfo } = useApp();
  const [formData, setFormData] = useState(clinicInfo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateClinicInfo(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-white sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="black-piano p-6 text-white relative">
            <h2 className="text-xl font-playfair font-bold text-[#C5A059]">Identidade Clínica</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Personalize sua marca premium</p>
          </div>
          
          <div className="p-8 space-y-6">
             <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#C5A059]/30 flex items-center justify-center overflow-hidden bg-gray-50">
                    {formData.logo ? (
                      <img src={formData.logo} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-playfair text-[#C5A059]">{formData.name.charAt(0)}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 gold-gradient rounded-full border-2 border-white flex items-center justify-center text-[#0A0A0B] shadow-lg"
                  >
                    <Camera size={14} />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo ou Emblema</p>
             </div>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nome da Clínica</label>
                 <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 outline-none text-sm font-medium" 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Slogan / Tagline</label>
                 <input 
                  type="text" 
                  value={formData.tagline}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                  className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 outline-none text-sm font-medium" 
                 />
               </div>
             </div>
          </div>

          <div className="p-6 bg-gray-50/50 flex gap-4">
             <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancelar</button>
             <button onClick={handleSave} className="flex-[2] py-4 black-piano text-[#C5A059] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl btn-3d border border-[#C5A059]/20">Salvar Identidade</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ReminderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addReminder } = useApp();
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text) return;
    addReminder({
      id: Date.now().toString(),
      category: category || 'Geral',
      text
    });
    setCategory('');
    setText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl">
          <div className="black-piano p-6 text-white">
            <h2 className="text-xl font-playfair font-bold text-[#C5A059]">Novo Lembrete</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Categoria</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: WhatsApp, Clínica, Estoque" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 outline-none text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Lembrete</label>
              <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="O que você não pode esquecer?" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 outline-none text-sm font-medium resize-none" />
            </div>
            <button onClick={handleSave} className="w-full py-4.5 rounded-[18px] black-piano text-[#C5A059] text-[10px] font-black shadow-xl uppercase tracking-widest btn-3d">Adicionar Lembrete</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const AppointmentFormModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { clients, addAppointment } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    status: 'scheduled',
    service: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instagram?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, clients]);

  if (!isOpen) return null;

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setSearchQuery(client.name);
    setShowResults(false);
    setErrors(prev => ({...prev, client: false}));
  };

  const handleConfirm = () => {
    const newErrors: Record<string, boolean> = {
      client: !selectedClient,
      date: !formData.date,
      time: !formData.time,
      service: !formData.service
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err)) return;

    const newAppointment = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: formData.date,
      time: formData.time,
      service: formData.service,
      status: formData.status as any,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    addAppointment(newAppointment);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative w-full max-w-xl bg-white sm:rounded-[32px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] flex flex-col"
        >
          <div className="black-piano p-8 text-white relative flex-shrink-0">
            <div className="absolute inset-0 iridescent-bg opacity-10"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl lg:text-2xl font-playfair font-bold text-[#C5A059] tracking-tight">Novo Agendamento</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Experiência Lumière</p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
            <div className="space-y-3 relative">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-[#C5A059]" /> Cliente Vinculada
                </label>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/clients', { state: { openNewClient: true } });
                  }}
                  className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                >
                  <UserPlus size={10} /> Cadastrar Nova
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Pesquisar por nome ou instagram..."
                  className={`w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white focus:border-[#C5A059]/40 focus:ring-4 focus:ring-[#C5A059]/5 transition-all outline-none pr-12 ${selectedClient ? 'border-[#C5A059]/60' : ''} ${errors.client ? 'border-red-500/50 bg-red-50/20' : ''}`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                    if (selectedClient && e.target.value !== selectedClient.name) {
                      setSelectedClient(null);
                    }
                  }}
                  onFocus={() => setShowResults(true)}
                />
                {selectedClient ? (
                  <Check size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" strokeWidth={3} />
                ) : (
                  <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                )}
              </div>
              {errors.client && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest px-1">Selecione uma cliente da base</p>}

              <AnimatePresence>
                {showResults && (searchQuery || filteredResults.length > 0) && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-3 glass-card rounded-2xl shadow-2xl overflow-hidden z-20 max-h-64 overflow-y-auto"
                    >
                      {filteredResults.length > 0 ? (
                        filteredResults.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-white/80 transition-all text-left border-b border-gray-100/50 last:border-0"
                          >
                            <img src={client.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-[#C5A059]/20" alt={client.name} />
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-[#0A0A0B] truncate">{client.name}</p>
                              <div className="flex items-center gap-3">
                                <p className="text-[10px] text-gray-400 font-medium">{client.phone}</p>
                                <p className="text-[10px] text-[#C5A059] font-black italic truncate">{client.instagram}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        searchQuery && (
                          <div className="p-6 text-center">
                            <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-widest">Nenhuma cliente encontrada</p>
                            <button className="gold-gradient text-[#0A0A0B] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md btn-3d">
                              + Nova Cliente
                            </button>
                          </div>
                        )
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Calendar size={12} className="text-[#C5A059]" /> Data
                </label>
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-left text-sm font-medium outline-none transition-all active:scale-[0.98] focus:border-[#C5A059]/40 ${errors.date ? 'border-red-500/50 bg-red-50/20' : ''}`}
                >
                  {formData.date || "Selecionar..."}
                </button>
                <DatePickerModal 
                  isOpen={showDatePicker} 
                  onClose={() => setShowDatePicker(false)} 
                  selectedDate={formData.date}
                  onSelect={(date: string) => { setFormData({...formData, date}); setErrors(prev => ({...prev, date: false})); }} 
                />
              </div>
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Clock size={12} className="text-[#C5A059]" /> Horário
                </label>
                <button 
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className={`w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-left text-sm font-medium outline-none transition-all active:scale-[0.98] focus:border-[#C5A059]/40 ${errors.time ? 'border-red-500/50 bg-red-50/20' : ''}`}
                >
                  {formData.time || "Definir..."}
                </button>
                <TimePickerModal 
                  isOpen={showTimePicker} 
                  onClose={() => setShowTimePicker(false)} 
                  selectedTime={formData.time}
                  onSelect={(time: string) => { setFormData({...formData, time}); setErrors(prev => ({...prev, time: false})); }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Duração</label>
                <div className="relative">
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 transition-all text-sm font-medium outline-none appearance-none cursor-pointer"
                  >
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1h 30min</option>
                    <option value="120">2 horas</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Prioridade</label>
                <div className="relative">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 transition-all text-sm font-medium outline-none appearance-none cursor-pointer"
                  >
                    <option value="scheduled">VIP / Confirmado</option>
                    <option value="pending">Pendente</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Serviço Premium</label>
              <input 
                type="text" 
                placeholder="Ex: Limpeza de Pele Diamond, Microagulhamento..." 
                className={`w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 transition-all text-sm font-medium outline-none ${errors.service ? 'border-red-500/50 bg-red-50/20' : ''}`}
                value={formData.service}
                onChange={(e) => { setFormData({...formData, service: e.target.value}); setErrors(prev => ({...prev, service: false})); }}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Observações</label>
              <textarea 
                rows={3}
                placeholder="Detalhes importantes..."
                className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 outline-none text-sm font-medium resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-4.5 rounded-[18px] text-[10px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Descartar</button>
            <button 
              onClick={handleConfirm}
              className="flex-[2] py-4.5 rounded-[18px] black-piano text-[#C5A059] text-[10px] font-black shadow-xl hover:shadow-[#C5A059]/10 transition-all uppercase tracking-widest btn-3d border border-[#C5A059]/20"
            >
              Finalizar Agendamento
            </button>
          </div>
        </motion.div>
      </div>
      {showSuccess && <SuccessToast message="Confirmado com Sucesso ✨" />}
    </AnimatePresence>
  );
};

const Dashboard: React.FC = () => {
  const { appointments, clients, clinicInfo, reminders, deleteReminder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditClinicOpen, setIsEditClinicOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const navigate = useNavigate();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter for today's appointments and sort by time
  const todaysAppointments = useMemo(() => {
    return appointments
      .filter(app => app.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, todayStr]);

  // Count only today's and future non-canceled appointments
  const upcomingCount = useMemo(() => {
    return appointments.filter(app => app.date >= todayStr && app.status !== 'canceled').length;
  }, [appointments, todayStr]);

  // Lógica funcional para aniversariantes do dia
  const birthdaysToday = useMemo(() => {
    const today = new Date();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    return clients.filter(client => {
      if (!client.birthday) return false;
      const [year, month, day] = client.birthday.split('-').map(Number);
      return month === m && day === d;
    });
  }, [clients]);

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="grid grid-cols-2 gap-4 lg:gap-10">
        <StatCard title="Atendimentos Hoje" value={todaysAppointments.length.toString().padStart(2, '0')} icon={Clock} delay={0.1} />
        <StatCard 
          title="Agenda Ativa" 
          value={upcomingCount.toString().padStart(2, '0')} 
          icon={Calendar} 
          delay={0.2} 
          onClick={() => navigate('/agenda')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8 lg:space-y-12">
          <ScrollReveal delay={0.3}>
            <div className="black-piano text-white rounded-[32px] p-8 lg:p-12 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#C5A059]/20">
              <div className="absolute inset-0 iridescent-bg opacity-10"></div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-10 text-center sm:text-left">
                <div className="max-w-sm">
                  <h2 className="text-2xl lg:text-3xl font-playfair font-bold mb-4 leading-tight tracking-tight uppercase">{clinicInfo.name}</h2>
                  <p className="text-gray-500 text-xs lg:text-sm mb-8 leading-relaxed font-medium">
                    {clinicInfo.tagline}
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="gold-gradient text-[#0A0A0B] w-full sm:w-auto px-10 py-4 rounded-full font-black text-xs lg:text-sm transition-all shadow-[0_10px_20px_rgba(197,160,89,0.2)] btn-3d"
                  >
                    Agendar Horário
                  </button>
                </div>
                <div className="hidden sm:block">
                  <div className="relative group/logo">
                    <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-full border border-[#C5A059]/20 flex items-center justify-center p-3 glass-card bg-white/5 overflow-hidden">
                      <div className="w-full h-full rounded-full border-2 border-[#C5A059] flex items-center justify-center shadow-inner overflow-hidden">
                        {clinicInfo.logo ? (
                          <img src={clinicInfo.logo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl lg:text-7xl font-playfair text-[#C5A059] font-bold">{clinicInfo.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    {/* Clinic Edit Button - Desktop Only */}
                    <button 
                      onClick={() => setIsEditClinicOpen(true)}
                      className="hidden lg:flex absolute -top-2 -right-2 w-10 h-10 gold-gradient rounded-full items-center justify-center text-[#0A0A0B] shadow-xl opacity-0 group-hover/logo:opacity-100 transition-all duration-300 transform scale-75 group-hover/logo:scale-100 hover:rotate-12"
                      title="Editar Identidade da Clínica"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
            <ScrollReveal delay={0.4}>
              <div className="glass-card p-6 lg:p-8 rounded-[28px] h-full premium-shadow">
                <div className="flex justify-between items-center mb-6 lg:mb-8">
                  <h3 className="font-playfair font-bold text-lg text-[#0A0A0B]">Aniversários</h3>
                  <div className="p-2 rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
                    <Gift size={18} />
                  </div>
                </div>
                <div className="space-y-4 lg:space-y-6">
                  {birthdaysToday.length > 0 ? (
                    birthdaysToday.map((client) => (
                      <div key={client.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 group cursor-pointer" onClick={() => navigate('/clients')}>
                        <div className="relative">
                          <img src={client.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-[#C5A059]/20" alt={client.name} />
                          <div className="absolute -top-1 -right-1">
                            <Cake size={12} className="text-[#C5A059] drop-shadow-sm" />
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs lg:text-sm font-bold text-[#0A0A0B] truncate">{client.name}</p>
                          <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest mt-0.5">Parabéns pelo seu dia! ✨</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center opacity-40">
                      <Gift size={24} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nenhum aniversário hoje</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div className="glass-card p-6 lg:p-8 rounded-[28px] h-full premium-shadow border-l-4 border-[#C5A059]/30">
                <div className="flex justify-between items-center mb-6 lg:mb-8">
                  <h3 className="font-playfair font-bold text-lg text-[#0A0A0B]">Lembretes</h3>
                  <button 
                    onClick={() => setIsReminderModalOpen(true)}
                    className="p-2 rounded-lg bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20 transition-all active:scale-90"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                      <div key={reminder.id} className="p-4 bg-white/40 border border-gray-100 rounded-2xl relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 gold-gradient"></div>
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-1.5">{reminder.category}</p>
                          <button 
                            onClick={() => deleteReminder(reminder.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-xs lg:text-sm font-bold text-gray-700 leading-snug">{reminder.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sem lembretes ativos</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="space-y-8">
          <ScrollReveal delay={0.4}>
            <div className="glass-card rounded-[32px] p-6 lg:p-8 premium-shadow">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-playfair font-bold text-lg text-[#0A0A0B]">Próximos Hoje</h3>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 cursor-pointer hover:bg-white transition-all">
                  <Search size={16} />
                </div>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((app, index) => {
                    const client = clients.find(c => c.id === app.clientId);
                    return (
                      <UpcomingAppointment 
                        key={app.id}
                        name={app.clientName} 
                        time={app.time} 
                        service={app.service} 
                        photoUrl={client?.photoUrl}
                        delay={0.1 + index * 0.05}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <Calendar size={32} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Agenda Livre</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-8 py-4.5 rounded-[22px] border-2 border-dashed border-[#C5A059]/30 text-[#C5A059] font-black text-xs lg:text-sm hover:bg-[#C5A059]/5 transition-all flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                Agendar Agora
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <AppointmentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ClinicInfoModal isOpen={isEditClinicOpen} onClose={() => setIsEditClinicOpen(false)} />
      <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
