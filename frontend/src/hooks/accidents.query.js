import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accidentService } from '../services/api';

export const accidentKeys = {
  all: ['accidents'],
  lists: () => [...accidentKeys.all, 'list'],
  list: (searchName) => [...accidentKeys.lists(), { searchName }]
};

export const useAccidents = (searchName = '') => {
  return useQuery({
    queryKey: accidentKeys.list(searchName),
    queryFn: async () => {
      const response = await accidentService.getAll(1, 1000, searchName);
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useCreateAccident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accidentData) => {
      const response = await accidentService.create(accidentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accidentKeys.lists() });
    }
  });
};

export const useDeleteAccident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accidentId) => {
      const response = await accidentService.delete(accidentId);
      return { id: accidentId, ...response.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accidentKeys.lists() });
    }
  });
};