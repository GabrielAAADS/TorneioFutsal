import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastrarTorneio } from '../services/torneioService';
import { useState } from 'react';
import * as z from 'zod';

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
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);

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
        onTorneioCriado();
      } catch (error) {
          console.error('Erro ao cadastrar torneio:', error);
          alert('Erro ao cadastrar torneio.');
      }
    };
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <input {...register('descricao')} placeholder="Descrição" className="border p-2 w-full" />
        {errors.descricao && <p className="text-red-500">{errors.descricao.message}</p>}

        <input {...register('data')} placeholder="Data" type="date" className="border p-2 w-full" />
        {errors.data && <p className="text-red-500">{errors.data.message}</p>}

        <input {...register('campus')} placeholder="Campus" className="border p-2 w-full" />
        {errors.campus && <p className="text-red-500">{errors.campus.message}</p>}

        <input {...register('latitude')} placeholder="Latitude" className="border p-2 w-full" />
        {errors.latitude && <p className="text-red-500">{errors.latitude.message}</p>}

        <input {...register('longitude')} placeholder="Longitude" className="border p-2 w-full" />
        {errors.longitude && <p className="text-red-500">{errors.longitude.message}</p>}

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

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Cadastrar</button>
    </form>
    );
  }