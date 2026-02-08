
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Plus, X, Camera, Calendar as CalendarIcon, 
  FileText, ImageIcon, Clock, ChevronLeft, Upload, Trash2, Users
} from 'lucide-react';
import { useApp } from '../App';
import { Client, Appointment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Compressão Ultra para Base64 leve
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Qualidade 0.5 para garantir que múltiplas fotos caibam no limite de 1MB do doc
        resolve(canvas.toDataURL('image/jpeg', 0.5)); 
      };
    };
    reader.onerror = reject;
  });
};

const DossieModal = ({ isOpen, onClose, client }: { isOpen: boolean; onClose: () => void; client: Client | null }) => {
  const { appointments, updateAppointment } = useApp();
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const history = useMemo(() => 
    appointments.filter(a => a.clientId === client?.id).sort((a,b) => b.date.localeCompare(a.date))
  , [appointments, client]);

  useEffect(() => {
    if (selectedApp) {
      setNotes(selectedApp.serviceNotes || '');
      setPhotos(selectedApp.servicePhotos || []);
    }
  }, [selectedApp]);

  const save = async () => {
    if (!selectedApp) return;
    setSaving(true);
    await updateAppointment({ ...selectedApp, serviceNotes: notes, servicePhotos: photos });
    setSaving(false);
    setSelectedApp(null);
  };

  const addPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        const base64 = await compressImage(e.target.files[0]);
        setPhotos(prev => [...prev, base64]);
      } catch (err) {
        alert("Erro ao processar imagem");
      } finally {
        setUploading(false);
      }
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl rounded-[32px] h-full sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="black-piano p-6 text-white flex justify-between items-center relative flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src={client.photoUrl} className="w-10 h-10 rounded-full border border-[#C5A059]/40 object-cover" alt={client.name} />
            <div>
               <h2 className="text-xl font-playfair font-bold text-[#C5A059] tracking-tight">{client.name}</h2>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">Dossiê de Atendimento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Timeline de Sessões */}
          <div className={`w-full sm:w-80 border-r bg-gray-50/50 overflow-y-auto ${selectedApp ? 'hidden sm:block' : 'block'}`}>
            <div className="p-4 border-b bg-white/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Histórico de Sessões</p>
            </div>
            {history.length > 0 ? history.map(app => (
              <button 
                key={app.id} 
                onClick={() => setSelectedApp(app)} 
                className={`w-full p-6 text-left border-b transition-all relative group
                  ${selectedApp?.id === app.id ? 'bg-white border-l-4 border-l-[#C5A059] shadow-sm' : 'hover:bg-white'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-[#C5A059] tabular-nums">{app.date.split('-').reverse().join('/')}</span>
                  <span className="text-[10px] font-bold text-gray-400">{app.time}</span>
                </div>
                <h4 className="text-sm font-bold text-[#0A0A0B] truncate">{app.service}</h4>
                {app.servicePhotos && app.servicePhotos.length > 0 && (
                   <div className="flex items-center gap-1 mt-2 text-[9px] text-[#C5A059] font-black uppercase">
                     <ImageIcon size={10} /> {app.servicePhotos.length} Fotos
                   </div>
                )}
              </button>
            )) : (
              <div className="p-10 text-center text-gray-400">
                <p className="text-xs uppercase tracking-widest">Sem agendamentos</p>
              </div>
            )}
          </div>

          {/* Editor de Registro */}
          <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedApp ? 'hidden sm:flex' : 'flex'}`}>
            {selectedApp ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between sm:justify-start gap-4">
                  <button onClick={() => setSelectedApp(null)} className="sm:hidden p-2"><ChevronLeft/></button>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#0A0A0B]">Registro Profissional</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={12} className="text-[#C5A059]" /> Notas de Evolução
                    </label>
                    <textarea 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      className="w-full p-6 bg-gray-50 rounded-[24px] border border-gray-100 text-sm focus:bg-white focus:border-[#C5A059]/40 outline-none transition-all resize-none shadow-inner" 
                      placeholder="Descreva detalhes do procedimento, alergias, intercorrências ou preferências técnicas..." 
                      rows={6} 
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Camera size={12} className="text-[#C5A059]" /> Registro Visual (Antes/Depois)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((p, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-gray-100">
                          <img src={p} className="w-full h-full object-cover" alt={`Sessão ${i}`} />
                          <button 
                            onClick={() => removePhoto(i)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => fileRef.current?.click()} 
                        disabled={uploading}
                        className="aspect-square border-2 border-dashed border-[#C5A059]/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-[#C5A059] hover:bg-[#C5A059]/5 transition-colors group"
                      >
                        {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#C5A059] border-t-transparent" /> : (
                          <>
                            <Upload size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={addPhoto} />
                  </div>
                </div>

                <div className="p-6 sm:p-8 border-t bg-gray-50/50 flex gap-4">
                  <button onClick={() => setSelectedApp(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voltar</button>
                  <button 
                    onClick={save} 
                    disabled={saving} 
                    className="flex-[2] py-4 black-piano text-[#C5A059] rounded-2xl font-black uppercase tracking-widest shadow-xl btn-3d border border-[#C5A059]/20 flex items-center justify-center gap-3"
                  >
                    {saving ? 'Sincronizando...' : 'Salvar no Dossiê'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/30">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 border border-gray-100">
                  <FileText size={32} className="text-gray-100" />
                </div>
                <h4 className="text-sm font-playfair font-black text-gray-400 uppercase tracking-[0.4em]">Selecione uma sessão</h4>
                <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2">Para ver ou editar os registros premium</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientFormModal = ({ isOpen, onClose, initialData }: any) => {
  const { addClient, updateClient } = useApp();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { 
        id: Date.now().toString(), 
        name: '', 
        whatsapp: '', 
        instagram: '',
        photoUrl: 'https://picsum.photos/200/200?random=' + Math.floor(Math.random()*100) 
      });
    }
  }, [isOpen, initialData]);

  const save = async () => {
    if (!formData.name) return;
    setLoading(true);
    try {
      if (initialData) await updateClient(formData);
      else await addClient(formData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (e: any) => {
    if (e.target.files[0]) {
      setImgLoading(true);
      try {
        const base64 = await compressImage(e.target.files[0]);
        setFormData({ ...formData, photoUrl: base64 });
      } catch (err) {
        alert("Erro ao processar imagem");
      } finally {
        setImgLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden flex flex-col shadow-2xl h-full sm:h-auto">
        <div className="black-piano p-8 text-white relative flex-shrink-0">
          <h2 className="text-xl font-playfair font-bold text-[#C5A059] uppercase tracking-widest">{initialData ? 'Editar Perfil' : 'Novo Cadastro Premium'}</h2>
          <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10">
          <div className="flex flex-col items-center">
            <label className="cursor-pointer group relative">
              <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-[#C5A059]/30 overflow-hidden flex items-center justify-center p-1 group-hover:border-[#C5A059]/60 transition-all">
                {imgLoading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#C5A059] border-t-transparent" /> : (
                  <img src={formData.photoUrl} className="w-full h-full object-cover rounded-full" alt="Preview" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 gold-gradient rounded-full flex items-center justify-center text-[#0A0A0B] shadow-lg border-2 border-white">
                <Camera size={16} />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={onFile} />
            </label>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">Foto de Identificação</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nome Completo</label>
              <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-[#C5A059]/40 outline-none transition-all" placeholder="Nome da cliente" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">WhatsApp</label>
                <input value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-[#C5A059]/40 outline-none transition-all" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Instagram</label>
                <input value={formData.instagram || ''} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-[#C5A059]/40 outline-none transition-all" placeholder="@usuario" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancelar</button>
          <button onClick={save} disabled={loading || imgLoading} className="flex-[2] py-4 black-piano text-[#C5A059] rounded-2xl font-black uppercase tracking-widest shadow-xl btn-3d border border-[#C5A059]/20">
            {loading ? 'Processando...' : 'Efetivar Cadastro'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Clients = () => {
  const { clients } = useApp();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDossieOpen, setIsDossieOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = useMemo(() => 
    clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  , [clients, search]);

  return (
    <div className="space-y-8 lg:space-y-12 pb-10">
      <div className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#C5A059]/40 transition-all" 
            placeholder="Pesquisar por nome ou whatsapp..." 
          />
        </div>
        <button onClick={() => { setSelected(null); setIsFormOpen(true); }} className="px-10 py-4 black-piano text-[#C5A059] rounded-2xl font-black text-xs uppercase tracking-widest btn-3d shadow-xl border border-[#C5A059]/20 flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={3} /> Novo Cadastro
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.length > 0 ? filtered.map(c => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={c.id} 
            className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 text-center group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="relative mb-6">
              <img src={c.photoUrl || 'https://via.placeholder.com/150'} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-[#F5F5F7] shadow-xl group-hover:border-[#C5A059]/20 transition-all" alt={c.name} />
              <div className="absolute bottom-0 right-1/2 translate-x-12 w-8 h-8 gold-gradient rounded-full border-4 border-white flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-[#0A0A0B] rounded-full"></div>
              </div>
            </div>
            <h3 className="font-playfair font-bold text-lg text-[#0A0A0B] mb-1 truncate px-2">{c.name}</h3>
            <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-8">{c.whatsapp || 'Sem contato'}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setSelected(c); setIsDossieOpen(true); }} 
                className="py-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#C5A059]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Dossiê
              </button>
              <button 
                onClick={() => { setSelected(c); setIsFormOpen(true); }} 
                className="py-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#C5A059]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Editar
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center opacity-30">
            {/* Added missing 'Users' import from 'lucide-react' to fix the reference error on line 379 */}
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm font-black uppercase tracking-[0.4em]">Nenhuma cliente vinculada</p>
          </div>
        )}
      </div>

      <ClientFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={selected} />
      <DossieModal isOpen={isDossieOpen} onClose={() => setIsDossieOpen(false)} client={selected} />
    </div>
  );
};

export default Clients;
