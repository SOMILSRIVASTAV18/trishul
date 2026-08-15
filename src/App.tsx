import React, { useState, useEffect } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { OpeningAnimation } from './components/OpeningAnimation';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { DashboardView } from './pages/DashboardView';
import { CustomersView } from './pages/CustomersView';
import { LeadsView } from './pages/LeadsView';
import { TasksView } from './pages/TasksView';
import { EmployeesView } from './pages/EmployeesView';
import { ReportsView } from './pages/ReportsView';
import { AiAssistantView } from './pages/AiAssistantView';
import { SettingsView } from './pages/SettingsView';
import { LoginRegisterPage } from './components/auth/LoginRegisterPage';

// Modals
import { AddCustomerModal } from './components/modals/AddCustomerModal';
import { AddLeadModal } from './components/modals/AddLeadModal';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { AddEmployeeModal } from './components/modals/AddEmployeeModal';
import { AuthModal } from './components/modals/AuthModal';

const MainLayout: React.FC = () => {
  const { isDarkMode, settings, currentUser } = useCrm();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Auto-close sidebar on mobile initially
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Strict Authentication Gatekeeper:
  // If user is not logged in, they CANNOT view the dashboard/admin panel.
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-black text-slate-100' : 'bg-slate-50 text-slate-900'} antialiased font-sans`}>
        {showIntro && (
          <OpeningAnimation onComplete={() => setShowIntro(false)} />
        )}
        <LoginRegisterPage onSuccess={() => setCurrentPage('dashboard')} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-black text-slate-100' : 'bg-slate-50 text-slate-900'} antialiased flex flex-col font-sans transition-colors duration-200`}>
      {/* Cinematic Opening Animation */}
      {showIntro && (
        <OpeningAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* Main App Shell */}
      <div className="flex-1 flex bg-slate-50 dark:bg-black min-h-screen">
        {/* Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-black transition-all duration-300 ${
            sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
          }`}
        >
          {/* Top Sticky Navbar */}
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigate={(page) => setCurrentPage(page)}
            onReplayIntro={() => setShowIntro(true)}
          />

          {/* Page Body */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-slate-50 dark:bg-black min-h-full transition-colors">
            {currentPage === 'dashboard' && (
              <DashboardView
                onNavigate={(page) => setCurrentPage(page)}
                onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
                onOpenAddLead={() => setIsAddLeadOpen(true)}
                onOpenAddTask={() => setIsAddTaskOpen(true)}
              />
            )}

            {currentPage === 'customers' && (
              <CustomersView onOpenAddModal={() => setIsAddCustomerOpen(true)} />
            )}

            {currentPage === 'leads' && (
              <LeadsView onOpenAddModal={() => setIsAddLeadOpen(true)} />
            )}

            {currentPage === 'tasks' && (
              <TasksView onOpenAddModal={() => setIsAddTaskOpen(true)} />
            )}

            {currentPage === 'employees' && (
              <EmployeesView onOpenAddModal={() => setIsAddEmployeeOpen(true)} />
            )}

            {currentPage === 'reports' && (
              <ReportsView />
            )}

            {currentPage === 'ai-assistant' && (
              <AiAssistantView />
            )}

            {currentPage === 'settings' && (
              <SettingsView />
            )}

            {currentPage === 'auth' && (
              <div className="py-4">
                <LoginRegisterPage onSuccess={() => setCurrentPage('dashboard')} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainLayout />
    </CrmProvider>
  );
}
