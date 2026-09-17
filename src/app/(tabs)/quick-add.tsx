import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function QuickAddScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/add-expense');
  }, [router]);

  return null;
}
