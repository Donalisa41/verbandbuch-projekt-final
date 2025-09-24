import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accidentService } from '../services/api';

export const accidentKeys = {
  all: ['accidents'],
  lists: () => [...accidentKeys.all, 'list'],
  list: (page, searchName) => [...accidentKeys.lists(), { page, searchName }]
};

export const useAccidents = (page = 1, searchName = '') => {
  return useQuery({
    queryKey: accidentKeys.list(page, searchName),
    queryFn: async () => {
      const response = await accidentService.getAll(page, 10, searchName);
      return {
        accidents: response.data.data,
        pagination: response.data.pagination
      };
    },
    keepPreviousData: true,
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