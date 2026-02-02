
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  MoreHorizontal,
  X,
  User,
  ChevronDown,
  Activity,
  UserPlus,
  Search,
  Check,
  FileText
} from 'lucide-react';
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
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 text-gray-400 hover:text-[#C5A059]"><ChevronLeft size={18}/></button>
        <h4 className="font-playfair font-bold text-sm uppercase tracking-widest text-[#0A0A0B]">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 text-gray-400 hover:text-[#C5A059]"><ChevronRight size={18}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <span key={d} className="text-[10px] font-bold text-gray-300">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: daysInMonth.firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth.days }).map((_, i) => {
          const day = i + 1;
          const isSelected = selectedDate && new Date(selectedDate + "T12:00:00").getDate() === day && new Date(selectedDate + "T12:00:00").getMonth() === currentMonth.getMonth();
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
    <span className="font-bold text-xs uppercase tracking-widest">{message}</span>
  </motion.div>
);

const AppointmentFormModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { clients, addAppointment } = useApp();
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
                <button className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity">
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
                  <CalendarIcon size={12} className="text-[#C5A059]" /> Data
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
                  <Clock size={12} className="text-[#C5A059]" /> Início
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
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1h 00min</option>
                    <option value="90">1h 30min</option>
                    <option value="120">2h 00min</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status Inicial</label>
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
                placeholder="Ex: Microagulhamento, Drenagem Diamond..." 
                className={`w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 transition-all text-sm font-medium outline-none ${errors.service ? 'border-red-500/50 bg-red-50/20' : ''}`}
                value={formData.service}
                onChange={(e) => { setFormData({...formData, service: e.target.value}); setErrors(prev => ({...prev, service: false})); }}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <FileText size={12} className="text-[#C5A059]" /> Observações
              </label>
              <textarea 
                rows={3}
                placeholder="Detalhes importantes ou preferências da cliente..."
                className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 transition-all text-sm font-medium outline-none resize-none"
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
      {showSuccess && <SuccessToast message="Agendamento confirmado ✨" />}
    </AnimatePresence>
  );
};

const Agenda: React.FC = () => {
  const { appointments } = useApp();
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const filteredAppointments = useMemo(() => {
    const selDate = new Date(selectedDay + "T12:00:00");
    
    if (view === 'daily') {
      return appointments.filter(app => app.date === selectedDay);
    } else if (view === 'weekly') {
      const dayOfWeek = selDate.getDay();
      const start = new Date(selDate);
      start.setDate(selDate.getDate() - dayOfWeek);
      start.setHours(0,0,0,0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);

      return appointments.filter(app => {
        const appDate = new Date(app.date + "T12:00:00");
        return appDate >= start && appDate <= end;
      }).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
    } else {
      const month = currentCalendarMonth.getMonth();
      const year = currentCalendarMonth.getFullYear();
      return appointments.filter(app => {
        const appDate = new Date(app.date + "T12:00:00");
        return appDate.getMonth() === month && appDate.getFullYear() === year;
      }).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
    }
  }, [appointments, selectedDay, view, currentCalendarMonth]);

  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, month, year };
  }, [currentCalendarMonth]);

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDay(todayStr);
    setCurrentCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between glass-card p-6 rounded-[32px] premium-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
              <button 
                onClick={() => setView('daily')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${view === 'daily' ? 'black-piano text-[#C5A059] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Dia
              </button>
              <button 
                onClick={() => setView('weekly')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${view === 'weekly' ? 'black-piano text-[#C5A059] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Sem.
              </button>
              <button 
                onClick={() => setView('monthly')}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${view === 'monthly' ? 'black-piano text-[#C5A059] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Mês
              </button>
            </div>
            
            <div className="flex items-center justify-between sm:justify-center gap-6 bg-gray-50/80 px-6 py-3 rounded-2xl border border-gray-100 shadow-inner">
              <button onClick={handlePrevMonth} className="text-gray-400 hover:text-[#0A0A0B] active:scale-90 transition-all p-1.5"><ChevronLeft size={18} /></button>
              <h3 className="font-playfair font-bold text-xs lg:text-sm uppercase tracking-[0.2em] text-center min-w-[140px] whitespace-nowrap text-[#0A0A0B]">
                {monthNames[calendarDays.month]} {calendarDays.year}
              </h3>
              <button onClick={handleNextMonth} className="text-gray-400 hover:text-[#0A0A0B] active:scale-90 transition-all p-1.5"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleToday}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white border border-gray-200 text-[10px] font-black text-gray-500 hover:text-[#0A0A0B] hover:border-gray-300 active:bg-gray-50 transition-all uppercase tracking-widest shadow-sm"
            >
              <CalendarIcon size={16} />
              Hoje
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-[2] lg:flex-none flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl black-piano text-[#C5A059] text-[10px] font-black shadow-xl active:scale-[0.97] transition-all uppercase tracking-widest btn-3d border border-[#C5A059]/20"
            >
              <Plus size={18} strokeWidth={3} />
              Reservar
            </button>
          </div>
        </div>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 order-2 lg:order-1">
          <ScrollReveal delay={0.1}>
            <div className="glass-card rounded-[32px] overflow-hidden premium-shadow">
              <div className="p-8 lg:p-10 border-b border-gray-100 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 iridescent-bg opacity-5"></div>
                <h4 className="font-playfair font-bold text-xl lg:text-2xl text-[#0A0A0B] relative z-10">
                  {view === 'daily' && `Hoje, ${new Date(selectedDay + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                  {view === 'weekly' && `Agenda da Semana`}
                  {view === 'monthly' && `Agenda de ${monthNames[calendarDays.month]}`}
                </h4>
                <div className="flex gap-4 text-[9px] lg:text-[10px] uppercase font-black tracking-[0.2em] relative z-10">
                  <span className="flex items-center gap-2 text-[#C5A059]"><span className="w-2 h-2 rounded-full gold-gradient"></span> VIP</span>
                  <span className="flex items-center gap-2 text-[#0A0A0B]"><span className="w-2 h-2 rounded-full black-piano"></span> FIXA</span>
                </div>
              </div>

              <div className="p-6 lg:p-10">
                <div className="space-y-6 lg:space-y-10">
                  {view === 'daily' ? (
                    hours.map((hour) => {
                      const appointment = filteredAppointments.find(a => a.time === hour);
                      return (
                        <div key={hour} className="flex gap-6 lg:gap-10 items-start">
                          <div className="w-12 lg:w-16 text-right pt-2">
                            <span className="text-xs lg:text-sm font-black text-gray-300 tabular-nums">{hour}</span>
                          </div>
                          <div className="flex-1 min-h-[50px] border-t border-gray-100/50 relative pt-4">
                            {appointment && (
                              <div className={`p-5 rounded-[24px] border-l-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer group 
                                ${appointment.status === 'scheduled' 
                                  ? 'bg-[#C5A059]/5 border-[#C5A059] text-[#0A0A0B]' 
                                  : 'black-piano border-[#C5A059]/40 text-white'}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="overflow-hidden pr-4">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                      <Clock size={12} className={appointment.status === 'scheduled' ? 'text-[#C5A059]' : 'text-gray-500'} />
                                      <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-70">Procedimento Premium</span>
                                    </div>
                                    <h5 className="font-playfair font-bold text-lg lg:text-xl mb-1.5 truncate tracking-tight">{appointment.clientName}</h5>
                                    <p className={`text-[11px] lg:text-xs font-medium truncate uppercase tracking-widest ${appointment.status === 'scheduled' ? 'text-gray-500' : 'text-gray-400'}`}>{appointment.service}</p>
                                  </div>
                                  <button className="p-2.5 rounded-2xl hover:bg-white/20 flex-shrink-0 transition-colors">
                                    <MoreHorizontal size={18} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-5">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((app) => (
                          <div key={app.id} className="flex gap-6 items-center p-5 rounded-[24px] border border-gray-100 hover:bg-white/80 transition-all group cursor-pointer premium-shadow">
                            <div className="w-16 flex flex-col items-center justify-center py-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-all shadow-inner border border-gray-100">
                              <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">{new Date(app.date + "T12:00:00").toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                              <span className="text-xl font-black text-[#0A0A0B] tabular-nums mt-0.5">{new Date(app.date + "T12:00:00").getDate()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="text-[11px] font-black text-[#C5A059] tabular-nums">{app.time}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold truncate">{app.service}</span>
                                </div>
                                <h5 className="font-playfair font-bold text-lg text-[#0A0A0B] truncate tracking-tight">{app.clientName}</h5>
                            </div>
                            <button className="p-3 text-gray-300 hover:text-[#0A0A0B] transition-colors"><MoreHorizontal size={18}/></button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-32 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                            <p className="text-[11px] text-gray-400 uppercase tracking-[0.4em] font-black">Nenhum Registro Encontrado</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="w-full lg:w-96 order-1 lg:order-2 space-y-8">
          <ScrollReveal delay={0.2}>
            <div className="glass-card p-8 rounded-[32px] premium-shadow border-t-4 border-[#C5A059]/20">
              <h4 className="font-playfair font-bold mb-8 text-center text-lg text-[#0A0A0B] tracking-tight">{monthNames[calendarDays.month]}</h4>
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <span key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: calendarDays.firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: calendarDays.days }).map((_, i) => {
                  const day = i + 1;
                  const dayStr = `${calendarDays.year}-${(calendarDays.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const hasApp = appointments.some(app => app.date === dayStr);
                  const isSelected = selectedDay === dayStr;

                  return (
                    <button 
                      key={i} 
                      onClick={() => setSelectedDay(dayStr)}
                      className={`h-10 lg:h-11 rounded-xl text-xs font-black transition-all relative flex items-center justify-center tabular-nums
                        ${isSelected ? 'black-piano text-[#C5A059] shadow-lg scale-105' : 'text-gray-400 hover:bg-gray-50'}
                      `}
                    >
                      {day}
                      {hasApp && !isSelected && (
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full gold-gradient shadow-sm"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
          
          <div className="hidden lg:block">
            <ScrollReveal delay={0.3}>
              <div className="black-piano p-8 rounded-[32px] border border-[#C5A059]/20 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 iridescent-bg opacity-10"></div>
                <div className="relative z-10">
                  <h4 className="text-[#C5A059] font-playfair font-bold text-xl mb-3 tracking-tight">Resumo Executivo</h4>
                  <p className="text-gray-500 text-xs mb-8 leading-relaxed font-medium tracking-wide">
                    Atualmente você possui <span className="text-[#C5A059] font-black">{filteredAppointments.length}</span> atendimentos premium agendados para este período.
                  </p>
                  <button className="w-full py-4 rounded-[20px] gold-gradient text-[#0A0A0B] font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg btn-3d">
                    Relatório Detalhado
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <AppointmentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Agenda;
