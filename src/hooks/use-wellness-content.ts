import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { wellnessContent as bundledContent } from '@/data/seed';
import { firestore } from '@/services/firebase';
import type { WellnessContent } from '@/types/domain';

export function useWellnessContent() {
  const [content, setContent] = useState(bundledContent);
  useEffect(() => {
    if (!firestore) return;
    return onSnapshot(query(collection(firestore, 'content'), where('published', '==', true)), (snapshot) => {
      if (snapshot.empty) return;
      setContent(snapshot.docs.map((document) => {
        const bundled = bundledContent.find((item) => item.id === document.id);
        return { ...bundled, ...document.data(), id: document.id } as WellnessContent;
      }).filter((item) => item.title && item.type));
    });
  }, []);
  return content;
}
