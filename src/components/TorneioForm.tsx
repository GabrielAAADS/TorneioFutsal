import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastrarTorneio } from '../services/torneioService';
import { useState } from 'react';
import { MapaLocal } from '../components/MapLocal';
import * as Dialog from '@radix-ui/react-dialog';
import * as z from 'zod';
import 'leaflet/dist/leaflet.css';

const schema = z.object({
      descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
      data: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        {
          message: 'Data inválida! Escolha uma data válida.',
        }
      ),
      campus: z.string().min(3, 'O campus deve ter pelo menos 3 caracteres'),
      latitude: z.string().refine(
        (val) => !isNaN(Number(val)),
        'Latitude deve ser um número válido'
      ),
      longitude: z.string().refine(
        (val) => !isNaN(Number(val)),
        'Longitude deve ser um número válido'
      ),
      img_local: z
        .instanceof(FileList)
        .refine((files) => files.length > 0, 'A imagem é obrigatória'),
    });
    

  export default function TorneioForm({ onTorneioCriado }: { onTorneioCriado: () => void }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
      resolver: zodResolver(schema),
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mapLat, setMapLat] = useState('');
    const [mapLng, setMapLng] = useState('');
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [localDesc, setLocalDesc] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          console.log("Arquivo selecionado:", file);
          setSelectedFile(file);
      }
  };  
  
  const onSubmit = async (data: any) => {
      try {

        if (isNaN(Date.parse(data.data))) {
          alert("Erro: Data inválida! Escolha uma data correta.");
          return;
        }
        
        const formData = new FormData();
        formData.append('descricao', data.descricao);
        formData.append('data', data.data);
        formData.append('campus', data.campus);
        formData.append('latitude', mapLat);
        formData.append('longitude', mapLng);

        if (selectedFile) {
          formData.append("img_local", selectedFile);
        } else {
            console.error("⚠ Nenhuma imagem foi adicionada ao FormData!");
            return;
        }

        await cadastrarTorneio(formData);
        alert('Torneio cadastrado com sucesso!');
        reset();
        setSelectedFile(null);
        setMapLat('');
        setMapLng('');
        onTorneioCriado();
      } catch (error) {
          console.error('Erro ao cadastrar torneio:', error);
          alert('Erro ao cadastrar torneio.');
      }
    };

    async function handleSelectLocation(latStr: string, lngStr: string) {
      setMapLat(latStr);
      setMapLng(lngStr);
  
  
      const latNum = parseFloat(latStr);
      const lngNum = parseFloat(lngStr);
  
      const addr = await reverseGeocode(latNum, lngNum);
      setLocalDesc(addr);
      setIsMapOpen(false);
    }

    async function reverseGeocode(lat: number, lng: number): Promise<string> {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Falha ao buscar endereço");
        }
        const data = await response.json();
        return data.display_name || "Endereço não encontrado";
      } catch {
        return "Não foi possível obter endereço.";
      }
    }
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <input {...register('descricao')} placeholder="Descrição" className="border p-2 w-full" />
        {errors.descricao && <p className="text-red-500">{errors.descricao.message}</p>}

        <input {...register('data')} placeholder="Data" type="date" className="border p-2 w-full" />
        {errors.data && <p className="text-red-500">{errors.data.message}</p>}

        <input {...register('campus')} placeholder="Campus" className="border p-2 w-full" />
        {errors.campus && <p className="text-red-500">{errors.campus.message}</p>}

        <input type="hidden" {...register('latitude')} value={mapLat} />
        <input type="hidden" {...register('longitude')} value={mapLng} />

        {(errors.latitude?.message || errors.longitude?.message) && (
          <p className="text-red-500">
            {errors.latitude?.message || errors.longitude?.message}
          </p>
        )}

        <input
          type="file"
          accept="image/*"
          {...register('img_local')}
          onChange={(e) => {
            handleFileChange(e);
            register("img_local").onChange(e);
          }}
          className="border p-2 w-full"
        />
        {errors.img_local?.message && <p className="text-red-500">{String(errors.img_local.message)}</p>}

        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Selecionar Local no Mapa
        </button>

        {localDesc && (
          <p className="text-sm text-gray-600 mt-2">
            Local Selecionado: <strong>{localDesc}</strong>
          </p>
        )}

        <Dialog.Root open={isMapOpen} onOpenChange={setIsMapOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
              <Dialog.Content
                className="fixed bg-white p-4 rounded shadow-md w-[600px] h-[500px] flex flex-col"
                style={{
                  top: '20%',
                  left: '50%',
                  transform: 'translate(-50%, 0)',
                  position: 'fixed'
                }}
              >
                <Dialog.Title className="text-lg font-bold mb-2">Escolha o Local</Dialog.Title>
                <div className="flex-1 overflow-hidden relative">
                  <MapaLocal lat={mapLat} lng={mapLng} onLocationSelect={handleSelectLocation} />
                </div>
                
                <Dialog.Close asChild>
                  <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded mt-2">
                    Fechar
                  </button>
                </Dialog.Close>
              </Dialog.Content>

          </Dialog.Portal>
        </Dialog.Root>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Cadastrar</button>
    </form>
    );
  }