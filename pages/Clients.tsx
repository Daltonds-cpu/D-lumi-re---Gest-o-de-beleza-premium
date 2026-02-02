
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Instagram, 
  Facebook, 
  MoreVertical,
  X,
  Camera,
  Calendar as CalendarIcon,
  Tag,
  User,
  Phone as PhoneIcon,
  Mail,
  FileText,
  ChevronDown,
  Check,
  Send,
  Edit2,
  Trash2,
  Clock,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  MessageCircle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import { Client, Appointment } from '../types';
import { useApp } from '../App';

/**
 * Modal for client dossier (History and Service Records)
 */
const DossieModal: React.FC<{ isOpen: boolean; onClose: () => void; client: Client | null }> = ({ isOpen, onClose, client }) => {
  const { appointments, updateAppointment } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [serviceNotes, setServiceNotes] = useState('');
  const [servicePhotos, setServicePhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const history = useMemo(() => {
    if (!client) return [];
    return appointments
      .filter(a => a.clientId === client.id)
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [client, appointments]);

  useEffect(() => {
    if (selectedAppointment) {
      setServiceNotes(selectedAppointment.serviceNotes || '');
      setServicePhotos(selectedAppointment.servicePhotos || []);
    } else {
      setServiceNotes('');
      setServicePhotos([]);
    }
  }, [selectedAppointment]);

  const handleSaveRecord = () => {
    if (!selectedAppointment) return;
    setIsSaving(true);
    const updated = {
      ...selectedAppointment,
      serviceNotes,
      servicePhotos
    };
    updateAppointment(updated);
    setTimeout(() => {
      setIsSaving(false);
      setSelectedAppointment(null);
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setServicePhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setServicePhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || !client) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md" />
        <motion.div 
          initial={{ opacity: 0, y: 100 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 100 }} 
          className="relative w-full max-w-4xl bg-white sm:rounded-[40px] shadow-2xl overflow-hidden h-full sm:h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="black-piano p-6 lg:p-8 text-white flex-shrink-0 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 iridescent-bg opacity-10"></div>
            <div className="relative z-10 flex items-center gap-6">
              <img src={client.photoUrl} className="w-16 h-16 rounded-full border-2 border-[#C5A059]/40 object-cover shadow-xl" alt={client.name} />
              <div>
                <h2 className="text-xl lg:text-2xl font-playfair font-bold text-[#C5A059] tracking-tight">{client.name}</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black">Dossiê de Atendimento</p>
              </div>
            </div>
            <button onClick={onClose} className="relative z-10 p-2.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* History List */}
            <div className={`flex-1 flex flex-col overflow-hidden border-r border-gray-100 ${selectedAppointment ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Histórico de Agendamentos</h3>
                <span className="px-2.5 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[9px] font-black uppercase tracking-widest">{history.length} sessões</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.map((app) => (
                  <button 
                    key={app.id} 
                    onClick={() => setSelectedAppointment(app)}
                    className={`w-full text-left p-5 rounded-[24px] border transition-all duration-300 group
                      ${selectedAppointment?.id === app.id 
                        ? 'black-piano border-[#0A0A0B] shadow-xl translate-x-1' 
                        : 'bg-white border-gray-100 hover:border-[#C5A059]/30 hover:bg-gray-50/50 shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={12} className={selectedAppointment?.id === app.id ? 'text-[#C5A059]' : 'text-gray-300'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedAppointment?.id === app.id ? 'text-[#C5A059]' : 'text-gray-400'}`}>
                          {new Date(app.date + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${app.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-400'}`}>
                        {app.status === 'scheduled' ? 'Agendado' : 'Finalizado'}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold tracking-tight mb-1 truncate ${selectedAppointment?.id === app.id ? 'text-white' : 'text-[#0A0A0B]'}`}>
                      {app.service}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] tabular-nums ${selectedAppointment?.id === app.id ? 'text-gray-500' : 'text-gray-400'}`}>{app.time}</span>
                      {(app.servicePhotos?.length || 0) > 0 && (
                        <span className="flex items-center gap-1 text-[9px] text-[#C5A059] font-black uppercase tracking-widest">
                          <ImageIcon size={10} /> {app.servicePhotos?.length} fotos
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200 m-2">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Nenhum registro</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details & Record Editor */}
            <div className={`flex-[1.5] flex flex-col overflow-hidden bg-white ${!selectedAppointment ? 'hidden lg:flex' : 'flex'}`}>
              {selectedAppointment ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                    <button onClick={() => setSelectedAppointment(null)} className="lg:hidden p-2 text-gray-400"><ChevronLeft size={20} /></button>
                    <div>
                      <h3 className="text-sm font-black text-[#0A0A0B] uppercase tracking-widest">Registro de Atendimento</h3>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">{selectedAppointment.service}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <FileText size={12} className="text-[#C5A059]" /> Observações Profissionais
                      </label>
                      <textarea 
                        rows={6} 
                        value={serviceNotes}
                        onChange={e => setServiceNotes(e.target.value)}
                        placeholder="Registre detalhes técnicos, produtos utilizados, reações da cliente ou observações para o próximo atendimento..."
                        className="w-full px-6 py-5 rounded-[24px] bg-gray-50 border-gray-100 border text-sm focus:bg-white focus:border-[#C5A059]/40 outline-none resize-none transition-all shadow-inner"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Camera size={12} className="text-[#C5A059]" /> Galeria do Atendimento
                        </label>
                        <button 
                          onClick={() => photoInputRef.current?.click()}
                          className="flex items-center gap-2 text-[10px] font-black text-[#C5A059] uppercase tracking-widest hover:opacity-70 transition-opacity"
                        >
                          <Upload size={12} /> Adicionar Fotos
                        </button>
                      </div>
                      <input ref={photoInputRef} type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {servicePhotos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square rounded-[20px] overflow-hidden group shadow-md">
                            <img src={photo} className="w-full h-full object-cover" alt="Service photo" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => removePhoto(idx)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => photoInputRef.current?.click()}
                          className="aspect-square rounded-[20px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:text-[#C5A059] hover:border-[#C5A059]/30 transition-all bg-gray-50/50"
                        >
                          <Plus size={24} strokeWidth={1} />
                          <span className="text-[8px] font-black uppercase tracking-widest mt-2">Nova Foto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
                    <button onClick={() => setSelectedAppointment(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voltar</button>
                    <button 
                      onClick={handleSaveRecord}
                      disabled={isSaving}
                      className="flex-[2] py-4 rounded-[18px] black-piano text-[#C5A059] text-[10px] font-black shadow-xl uppercase tracking-widest btn-3d border border-[#C5A059]/20 flex items-center justify-center gap-3"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Salvar no Dossiê
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/30">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-100 shadow-sm border border-gray-100 mb-6">
                    <FileText size={32} />
                  </div>
                  <h4 className="text-sm font-playfair font-black text-gray-400 uppercase tracking-[0.4em]">Selecione uma Sessão</h4>
                  <p className="text-[10px] text-gray-300 mt-4 font-bold uppercase tracking-widest max-w-xs leading-relaxed">Clique em um agendamento ao lado para visualizar e registrar os detalhes técnicos do atendimento.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * Modal for scheduling appointments directly from the clients page.
 */
const AppointmentFormModal = ({ isOpen, onClose, initialClient }: { isOpen: boolean; onClose: () => void, initialClient?: Client | null }) => {
  const { clients, addAppointment } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '60',
    status: 'scheduled',
    service: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialClient) {
      setSelectedClient(initialClient);
      setSearchQuery(initialClient.name);
    } else {
      setSelectedClient(null);
      setSearchQuery('');
    }
  }, [initialClient, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const newErrors: Record<string, boolean> = {
      client: !selectedClient,
      date: !formData.date,
      time: !formData.time,
      service: !formData.service
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(err => err)) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: formData.date,
      time: formData.time,
      service: formData.service,
      status: formData.status as any,
      notes: formData.notes
    };

    addAppointment(newAppointment);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); onClose(); }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative w-full max-w-xl bg-white sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="black-piano p-6 text-white flex justify-between items-center">
            <h2 className="text-xl font-playfair font-bold text-[#C5A059]">Agendar Horário</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Cliente</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  readOnly
                  placeholder="Selecione a cliente..."
                  className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.client ? 'border-red-300' : 'border-gray-100'} outline-none text-sm font-medium focus:bg-white focus:border-[#C5A059]/40`}
                />
                {selectedClient && <Check size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Data</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 border text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Horário</label>
                <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 border text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Serviço</label>
              <input type="text" placeholder="Ex: Limpeza de Pele Diamond" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-gray-100 border text-sm" />
            </div>
          </div>
          <div className="p-6 bg-gray-50 flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancelar</button>
            <button onClick={handleConfirm} className="flex-[2] py-4 black-piano text-[#C5A059] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl btn-3d">Confirmar</button>
          </div>
        </motion.div>
      </div>
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-[#0A0A0B] text-[#C5A059] px-8 py-4 rounded-full shadow-2xl border border-[#C5A059]/20 font-bold text-xs uppercase tracking-widest">
          Agendamento realizado ✨
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ClientCard: React.FC<{ 
  client: Client; 
  delay: number; 
  onSchedule: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onDossie: (client: Client) => void;
}> = ({ client, delay, onSchedule, onEdit, onDelete, onDossie }) => {
  const [showMenu, setShowMenu] = useState(false);
  const hasInsta = !!client.instagram && String(client.instagram).trim().length > 0;
  const hasFb = !!client.facebook && String(client.facebook).trim().length > 0;
  const hasWa = !!client.whatsapp && String(client.whatsapp).trim().length > 0;

  const handleInstagram = () => {
    if (!hasInsta) return;
    const handle = client.instagram!.replace('@', '').trim();
    window.open(`https://instagram.com/${handle}`, '_blank');
  };

  const handleFacebook = () => {
    if (!hasFb) return;
    const val = client.facebook!.trim();
    const url = val.startsWith('http') ? val : `https://facebook.com/${val}`;
    window.open(url, '_blank');
  };

  const handleWhatsApp = () => {
    if (!hasWa) return;
    const cleanNumber = client.whatsapp!.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <ScrollReveal delay={delay} direction="up" className="w-full relative">
      <div className="glass-card rounded-[32px] overflow-hidden premium-shadow transition-all duration-500 group border border-gray-100/50 hover:scale-[1.02] active:scale-[0.98]">
        <div className="h-24 lg:h-28 black-piano relative">
          <div className="absolute inset-0 iridescent-bg opacity-10"></div>
          
          <div className="absolute top-5 right-5 z-20">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-white/30 hover:text-white transition-colors p-2 bg-white/5 rounded-xl border border-white/5"
            >
              <MoreVertical size={18} />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 glass-card rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                  >
                    <button 
                      onClick={() => { onEdit(client); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold text-gray-600 hover:bg-[#C5A059]/5 hover:text-[#C5A059] transition-all border-b border-gray-50"
                    >
                      <Edit2 size={14} /> Editar cadastro
                    </button>
                    <button 
                      onClick={() => { onDelete(client.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold text-red-400 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} /> Excluir cadastro
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-6 lg:px-8 pb-8 text-center -mt-12 lg:-mt-14 relative z-10">
          <div className="relative inline-block mb-5">
            <img 
              src={client.photoUrl} 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-[6px] border-[#F5F5F7] shadow-xl object-cover mx-auto"
              alt={client.name}
            />
            <div className="absolute bottom-1 right-1 w-8 h-8 gold-gradient rounded-full border-4 border-[#F5F5F7] flex items-center justify-center shadow-lg">
              <Check size={14} strokeWidth={4} className="text-[#0A0A0B]" />
            </div>
            {client.status === 'vip' && (
               <div className="absolute -top-3 -left-3 px-3 py-1 black-piano text-[#C5A059] text-[9px] font-black rounded-full uppercase tracking-widest border border-[#C5A059]/30 shadow-lg">
                 VIP
               </div>
            )}
          </div>
          
          <h3 className="font-playfair font-bold text-lg lg:text-xl text-[#0A0A0B] truncate tracking-tight mb-1">{client.name}</h3>
          <p className="text-[10px] lg:text-xs text-gray-400 font-medium tracking-widest uppercase mb-8">{client.phone}</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={handleInstagram}
              disabled={!hasInsta}
              className={`w-10 h-10 lg:w-11 lg:h-11 rounded-[16px] bg-white border flex items-center justify-center transition-all shadow-sm ${hasInsta ? 'text-[#E1306C] border-[#E1306C]/30 hover:shadow-md hover:scale-110' : 'text-gray-300 border-gray-100 cursor-not-allowed'}`}
            >
              <Instagram size={18} />
            </button>
            <button 
              onClick={handleFacebook}
              disabled={!hasFb}
              className={`w-10 h-10 lg:w-11 lg:h-11 rounded-[16px] bg-white border flex items-center justify-center transition-all shadow-sm ${hasFb ? 'text-[#1877F2] border-[#1877F2]/30 hover:shadow-md hover:scale-110' : 'text-gray-300 border-gray-100 cursor-not-allowed'}`}
            >
              <Facebook size={18} />
            </button>
            <button 
              onClick={handleWhatsApp}
              disabled={!hasWa}
              className={`w-10 h-10 lg:w-11 lg:h-11 rounded-[16px] bg-white border flex items-center justify-center transition-all shadow-sm ${hasWa ? 'text-[#25D366] border-[#25D366]/30 hover:shadow-md hover:scale-110' : 'text-gray-300 border-gray-100 cursor-not-allowed'}`}
            >
              <MessageCircle size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onDossie(client)}
              className="py-3.5 rounded-[18px] border border-gray-200 text-[10px] font-black text-gray-500 hover:bg-white hover:text-[#0A0A0B] transition-all uppercase tracking-[0.2em] shadow-sm"
            >
              Dossiê
            </button>
            <button 
              onClick={() => onSchedule(client)}
              className="py-3.5 rounded-[18px] black-piano text-[#C5A059] text-[10px] font-black transition-all uppercase tracking-[0.2em] shadow-lg btn-3d border border-[#C5A059]/20"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

const ClientFormModal: React.FC<{ isOpen: boolean; onClose: () => void; initialData?: Client | null }> = ({ isOpen, onClose, initialData }) => {
  const [formData, setFormData] = useState<Partial<Client>>(initialData || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(initialData || {
      name: '',
      photoUrl: 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 100),
      whatsapp: '',
      facebook: '',
      email: '',
      instagram: '',
      createdAt: new Date().toISOString(),
      status: 'active',
      notes: '',
      tags: []
    });
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative w-full max-w-2xl bg-white sm:rounded-[40px] shadow-2xl overflow-hidden h-full sm:h-auto max-h-[95vh] flex flex-col">
          <div className="black-piano p-8 text-white relative flex-shrink-0">
            <div className="absolute inset-0 iridescent-bg opacity-10"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl lg:text-2xl font-playfair font-bold text-[#C5A059] tracking-tight">
                  {initialData ? 'Editar Cadastro' : 'Novo Perfil Premium'}
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-black">Cadastro Lumière</p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10">
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gray-50 border-2 border-dashed border-[#C5A059]/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#C5A059] shadow-inner">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Camera size={40} strokeWidth={1} className="text-gray-300 group-hover:text-[#C5A059] transition-colors" />
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-10 h-10 gold-gradient rounded-full border-4 border-white flex items-center justify-center text-[#0A0A0B] shadow-lg transition-transform group-hover:scale-110">
                  <Plus size={20} strokeWidth={3} />
                </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.3em] mt-4 px-1">Retrato da Cliente (Foto)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><User size={12} className="text-[#C5A059]" /> Nome Completo</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Helena Roitman" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1 text-[#C5A059]"><Send size={12} className="rotate-[-45deg]" /> WhatsApp</label>
                <input type="tel" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="(00) 00000-0000" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><Facebook size={12} className="text-[#C5A059]" /> Facebook</label>
                <input type="text" value={formData.facebook || ''} onChange={e => setFormData({...formData, facebook: e.target.value})} placeholder="Link ou perfil" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><Mail size={12} className="text-[#C5A059]" /> E-mail</label>
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="cliente@premium.com" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><Instagram size={12} className="text-[#C5A059]" /> Instagram</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C5A059] text-sm font-black">@</span>
                  <input type="text" value={formData.instagram?.replace('@', '') || ''} onChange={e => setFormData({...formData, instagram: '@' + e.target.value})} placeholder="username" className="w-full pl-10 pr-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><CalendarIcon size={12} className="text-[#C5A059]" /> Data de Nascimento</label>
                <input type="date" className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><ChevronDown size={12} className="text-[#C5A059]" /> Status do Cliente</label>
                <div className="relative">
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-5 py-4 rounded-[18px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none appearance-none">
                    <option value="active">Ativa</option>
                    <option value="vip">Premium / VIP</option>
                    <option value="inactive">Inativa</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><Tag size={12} className="text-[#C5A059]" /> Etiquetas</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-[18px] border border-gray-100">
                   <button className="px-3 py-1.5 rounded-full text-[9px] font-black black-piano text-[#C5A059] uppercase tracking-widest border border-[#C5A059]/30">Diamond</button>
                   <button className="px-3 py-1.5 rounded-full text-[9px] font-black bg-white text-gray-400 uppercase tracking-widest border border-gray-100">Facial</button>
                   <button className="px-3 py-1.5 rounded-full text-[9px] font-black bg-white text-gray-400 uppercase tracking-widest border border-gray-100">Laser</button>
                   <button className="p-1.5 rounded-full border border-dashed border-[#C5A059]/40 text-[#C5A059]"><Plus size={12}/></button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><FileText size={12} className="text-[#C5A059]" /> Observações</label>
              <textarea rows={4} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Notas importantes sobre a cliente..." className="w-full px-5 py-4 rounded-[22px] bg-gray-50 border-gray-100 border text-sm focus:bg-white outline-none resize-none"></textarea>
            </div>
          </div>
          <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-4.5 rounded-[18px] text-[10px] font-black text-gray-400 uppercase tracking-widest">Descartar</button>
            <button onClick={onClose} className="flex-[2] py-4.5 rounded-[18px] black-piano text-[#C5A059] text-[10px] font-black shadow-xl uppercase tracking-widest btn-3d">
              {initialData ? 'Salvar Alterações' : 'Efetivar Cadastro'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Clients: React.FC = () => {
  const { clients: appClients } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDossieModalOpen, setIsDossieModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filters, setFilters] = useState({ status: 'all', tags: [] as string[] });

  // Abre automaticamente o modal se vier do redirecionamento
  useEffect(() => {
    if (location.state?.openNewClient) {
      setIsModalOpen(true);
      // Limpa o estado para evitar reabertura indesejada
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filter local clients based on search and filters
  const filteredClients = useMemo(() => {
    return appClients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            client.phone.includes(searchTerm);
      const matchesStatus = filters.status === 'all' || client.status === filters.status;
      const matchesTags = filters.tags.length === 0 || filters.tags.every(tag => client.tags?.includes(tag));
      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [appClients, searchTerm, filters]);

  const handleSchedule = (client: Client) => {
    setSelectedClient(client);
    setIsScheduleModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDossie = (client: Client) => {
    setSelectedClient(client);
    setIsDossieModalOpen(true);
  };

  const handleDelete = (clientId: string) => {
    if (confirm("Deseja realmente excluir este cadastro premium?")) {
      alert("Cadastro removido com sucesso.");
    }
  };

  const openNewClientForm = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row gap-6 glass-card p-6 rounded-[32px] premium-shadow">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, contato ou classificação..."
              className="w-full pl-12 pr-6 py-4 rounded-[20px] bg-gray-50/80 border-gray-100 border focus:bg-white focus:border-[#C5A059]/40 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 min-w-[320px]">
            <button onClick={() => setIsFilterModalOpen(true)} className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-[20px] border bg-white border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-all">
              <Filter size={16} /> Filtros
            </button>
            <button onClick={openNewClientForm} className="flex-[1.5] flex items-center justify-center gap-2.5 px-6 py-4 rounded-[20px] black-piano text-[#C5A059] text-[10px] font-black shadow-xl btn-3d uppercase tracking-widest border border-[#C5A059]/20 transition-all">
              <Plus size={18} strokeWidth={3} /> Cadastrar
            </button>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
        {filteredClients.map((client, index) => (
          <ClientCard 
            key={client.id} 
            client={client} 
            delay={index * 0.05} 
            onSchedule={handleSchedule}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDossie={handleDossie}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <ScrollReveal className="text-center py-32 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
            <Search size={32} className="text-gray-200" />
          </div>
          <h3 className="text-sm font-playfair font-black text-gray-400 uppercase tracking-[0.4em]">Base de Clientes Vazia</h3>
          <p className="text-[10px] text-gray-300 mt-3 font-bold uppercase tracking-widest mb-8">Tente uma nova busca ou expanda os filtros.</p>
          <button onClick={openNewClientForm} className="px-8 py-4 black-piano text-[#C5A059] rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl btn-3d border border-[#C5A059]/20 mx-auto flex items-center gap-2">
            <Plus size={16} /> Novo Cadastro
          </button>
        </ScrollReveal>
      )}

      <ClientFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedClient} />
      <AppointmentFormModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} initialClient={selectedClient} />
      <DossieModal isOpen={isDossieModalOpen} onClose={() => setIsDossieModalOpen(false)} client={selectedClient} />
      
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterModalOpen(false)} className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-playfair font-bold text-[#0A0A0B]">Filtragem Refinada</h3>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><X size={24}/></button>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status do Cliente</p>
                <div className="grid grid-cols-2 gap-3">
                  {['all', 'active', 'vip', 'inactive'].map(status => (
                    <button key={status} onClick={() => setFilters({...filters, status})} className={`px-5 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest border transition-all ${filters.status === status ? 'black-piano text-[#C5A059] border-[#C5A059]/50 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}>
                      {status === 'all' ? 'Todos' : status === 'active' ? 'Ativa' : status === 'vip' ? 'VIP' : 'Inativa'}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="w-full py-4.5 black-piano text-[#C5A059] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl btn-3d">Aplicar Filtros</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clients;
