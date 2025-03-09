import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastrarTorneio } from '../services/torneioService';
import * as z from 'zod';

const schema = z.object({
    descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
    data: z.string(),
    campus: z.string().min(3, 'O campus deve ter pelo menos 3 caracteres'),
  });

  export default function TorneioForm({ onTorneioCriado }: { onTorneioCriado: () => void }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
      resolver: zodResolver(schema),
    });
  
    const onSubmit = async (data: any) => {
      try {
        await cadastrarTorneio(data);
        alert('Torneio cadastrado com sucesso!');
        reset();
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
  
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Cadastrar</button>
      </form>
    );
  }