import { useState, useCallback } from 'react';

interface UseShareAfterPublishReturn {
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  triggerShareModal: (programId: string, programTitle: string) => void;
  shareData: { programId: string; title: string } | null;
}

export function useShareAfterPublish(): UseShareAfterPublishReturn {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ programId: string; title: string } | null>(null);

  const triggerShareModal = useCallback((programId: string, programTitle: string) => {
    setShareData({ programId, title: programTitle });
    setShowShareModal(true);
  }, []);

  return {
    showShareModal,
    setShowShareModal,
    triggerShareModal,
    shareData,
  };
}
