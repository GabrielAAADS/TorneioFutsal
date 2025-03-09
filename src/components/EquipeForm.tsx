import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastrarEquipe, atualizarEquipe } from '../services/equipeService';
import * as z from 'zod';

const schema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  lema: z.string().optional(),
});

export default function EquipeForm({ equipe, idTorneio, onEquipeCriada }: { equipe?: any; idTorneio: string; onEquipeCriada: () => void }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: equipe || { nome: '', lema: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      if (equipe) {
        await atualizarEquipe(equipe.id, data);
        alert('Equipe atualizada com sucesso!');
      } else {
        await cadastrarEquipe({ ...data, id_torneio: idTorneio });
        alert('Equipe cadastrada com sucesso!');
      }
      reset();
      onEquipeCriada();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      alert('Erro ao salvar equipe.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <input {...register('nome')} placeholder="Nome da Equipe" className="border p-2 w-full" />
      {errors.nome && <p className="text-red-500">{String(errors.nome.message)}</p>}

      <input {...register('lema')} placeholder="Lema" className="border p-2 w-full" />
      {errors.lema && <p className="text-red-500">{String(errors.lema.message)}</p>}

      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
        {equipe ? 'Atualizar' : 'Cadastrar'}
      </button>
    </form>
  );
}
