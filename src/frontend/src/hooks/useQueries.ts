import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetBgRemoveApiKey() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['bgRemoveApiKey'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getBgRemoveApiKey();
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity, // API key doesn't change, cache forever
  });
}
