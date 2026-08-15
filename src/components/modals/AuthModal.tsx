import React from 'react';
import { LoginRegisterPage } from '../auth/LoginRegisterPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        <LoginRegisterPage
          isModal={true}
          onCloseModal={onClose}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
};
