// useCurrentAndPreviousRoute.js
import { useNavigationState } from '@react-navigation/native';

export const useCurrentAndPreviousRoute = () => {
  const routes = useNavigationState(state => state.routes);
  const index = useNavigationState(state => state.index);

  const currentRoute = routes?.[index] ?? null;
  const previousRoute = index > 0 ? routes?.[index - 1] : null;

  return { currentRoute, previousRoute };
};
