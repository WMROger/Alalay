import { Redirect } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Index() {
  const hasOnboarded = useStore((state) => state.hasOnboarded);

  if (!hasOnboarded) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/dashboard" />;
}
