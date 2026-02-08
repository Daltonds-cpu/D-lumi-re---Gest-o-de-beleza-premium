
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Plus, X, Camera, Calendar as CalendarIcon, 
  FileText, ImageIcon, Clock, ChevronLeft
} from 'lucide-react';
import { useApp } from '../App';
import { Client, Appointment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Compressão agressiva para evitar erros de limite do Firestore (1MB)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500; // Largura menor para Base64 leve
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
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Qualidade 0.6
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
    if (e.target.files) {
      const base64 = await compressImage(e.target.files[0]);
      setPhotos(prev => [...prev, base64]);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[32px] h-[80vh] flex flex-col overflow-hidden">
        <div className="black-piano p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-playfair text-[#C5A059]">Dossiê: {client.name}</h2>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r p-4 overflow-y-auto space-y-2">
            {history.map(app => (
              <button key={app.id} onClick={() => setSelectedApp(app)} className={`w-full p-4 rounded-xl text-left border ${selectedApp?.id === app.id ? 'bg-[#C5A059]/10 border-[#C5A059]' : ''}`}>
                <p className="text-xs font-bold">{app.date}</p>
                <p className="text-sm">{app.service}</p>
              </button>
            ))}
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedApp ? (
              <div className="space-y-6">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl" placeholder="Notas técnicas..." rows={5} />
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p, i) => <img key={i} src={p} className="w-full aspect-square object-cover rounded-lg" />)}
                  <button onClick={() => fileRef.current?.click()} className="aspect-square border-2 border-dashed flex items-center justify-center"><Plus/></button>
                </div>
                <input type="file" ref={fileRef} className="hidden" onChange={addPhoto} />
                <button onClick={save} disabled={saving} className="w-full py-4 black-piano text-[#C5A059] rounded-xl font-bold">
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            ) : <p className="text-center text-gray-400 mt-20">Selecione uma sessão ao lado</p>}
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

  useEffect(() => {
    if (isOpen) setFormData(initialData || { id: Date.now().toString(), name: '', whatsapp: '', photoUrl: '' });
  }, [isOpen, initialData]);

  const save = async () => {
    if (!formData.name) return;
    setLoading(true);
    if (initialData) await updateClient(formData);
    else await addClient(formData);
    setLoading(false);
    onClose();
  };

  const onFile = async (e: any) => {
    if (e.target.files[0]) {
      const base64 = await compressImage(e.target.files[0]);
      setFormData({ ...formData, photoUrl: base64 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
      <div className="bg-white p-8 rounded-[32px] w-full max-w-md space-y-6">
        <h2 className="text-xl font-playfair font-bold text-[#C5A059]">{initialData ? 'Editar' : 'Novo'} Cliente</h2>
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-[#C5A059] overflow-hidden flex items-center justify-center">
              {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <Camera/>}
            </div>
            <input type="file" className="hidden" onChange={onFile} />
          </label>
        </div>
        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-xl" placeholder="Nome completo" />
        <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-xl" placeholder="WhatsApp" />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400">Cancelar</button>
          <button onClick={save} disabled={loading} className="flex-[2] py-4 black-piano text-[#C5A059] rounded-xl font-bold">
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Clients = () => {
  const { clients } = useApp();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDossieOpen, setIsDossieOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex gap-4 bg-white p-4 rounded-3xl shadow-sm">
        <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent px-4 outline-none" placeholder="Buscar cliente..." />
        <button onClick={() => { setSelected(null); setIsFormOpen(true); }} className="px-6 py-3 black-piano text-[#C5A059] rounded-2xl font-bold">+ Novo</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[32px] shadow-sm text-center">
            <img src={c.photoUrl || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-[#C5A059]" />
            <h3 className="font-bold truncate">{c.name}</h3>
            <p className="text-xs text-gray-400 mb-6">{c.whatsapp}</p>
            <div className="flex gap-2">
              <button onClick={() => { setSelected(c); setIsDossieOpen(true); }} className="flex-1 py-2 bg-gray-50 rounded-lg text-[10px] font-bold">Dossiê</button>
              <button onClick={() => { setSelected(c); setIsFormOpen(true); }} className="flex-1 py-2 bg-gray-50 rounded-lg text-[10px] font-bold">Editar</button>
            </div>
          </div>
        ))}
      </div>
      <ClientFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={selected} />
      <DossieModal isOpen={isDossieOpen} onClose={() => setIsDossieOpen(false)} client={selected} />
    </div>
  );
};

export default Clients;
