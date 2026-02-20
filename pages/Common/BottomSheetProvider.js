import React, {createContext, useContext, useState, useCallback} from 'react';
import BottomSheetDialog from './BottomSheetDialog';

const BottomSheetContext = createContext(null);

export const BottomSheetProvider = ({children}) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState(null);

  /* ---------------- OPEN / CLOSE LOGIC ---------------- */

  const showBottomSheet = useCallback(component => {
    if (component) {
      // 🔥 Open sheet
      setContent(component);
      setVisible(true);
    } else {
      // 🔥 Close sheet
      setVisible(false);

      // Wait for animation to finish before clearing content
      setTimeout(() => {
        setContent(null);
      }, 300);
    }
  }, []);

  const hideBottomSheet = useCallback(() => {
    setVisible(false);

    setTimeout(() => {
      setContent(null);
    }, 300);
  }, []);

  /* ---------------- PROVIDER ---------------- */

  return (
    <BottomSheetContext.Provider
      value={{
        showBottomSheet,
        hideBottomSheet,
      }}>
      {children}

      <BottomSheetDialog visible={visible} onClose={hideBottomSheet}>
        {content}
      </BottomSheetDialog>
    </BottomSheetContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error('useBottomSheet must be used inside BottomSheetProvider');
  }

  return context;
};
