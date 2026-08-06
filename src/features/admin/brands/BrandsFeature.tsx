import React from 'react';
import { Plus, Clock, Award } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useBrands } from './hooks/useBrands';
import { BrandFilter } from './components/BrandFilter';
import { BrandTable } from './components/BrandTable';

const BrandFormModal = React.lazy(() =>
  import('./components/BrandFormModal').then((m) => ({ default: m.BrandFormModal })),
);
const BrandConfirmModal = React.lazy(() =>
  import('./components/BrandConfirmModal').then((m) => ({ default: m.BrandConfirmModal })),
);

export const BrandsFeature: React.FC = () => {
  const {
    t,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    activeBrands,
    deletedBrands,
    paginatedBrands,
    totalPages,
    isLoadingCurrent,
    isFormLoading,
    isConfirmLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    editingBrand,
    confirmModalState,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
  } = useBrands();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-indigo-500" />
            {t('brandManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('brandDesc')}
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden lg:inline">{t('addBrand')}</span>
          <span className="lg:hidden">{t('addBrandShort')}</span>
        </Button>
      </div>

      {/* Main Glassmorphism Workspace */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Filter bar */}
        <BrandFilter
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          activeCount={activeBrands.length}
          trashCount={deletedBrands.length}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Notice Banner for Recycle Bin */}
        {activeTab === 'TRASH' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>{t('brandTrashNotice')}</span>
          </div>
        )}

        {/* Brands List / Cards Grid & Pagination */}
        <BrandTable
          brands={paginatedBrands}
          activeTab={activeTab}
          viewMode={viewMode}
          isLoading={isLoadingCurrent}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={handleOpenEdit}
          onSoftDelete={(b) => openConfirmModal(b, 'SOFT_DELETE')}
          onRestore={(b) => openConfirmModal(b, 'RESTORE')}
          onHardDelete={(b) => openConfirmModal(b, 'HARD_DELETE')}
        />
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Form Modal (Add & Edit) */}
        <BrandFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingBrand}
          isLoading={isFormLoading}
        />

        {/* Confirmation Modal (Soft Delete, Restore, Hard Delete) */}
        <BrandConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          brand={confirmModalState.brand}
          type={confirmModalState.type}
          isLoading={isConfirmLoading}
        />
      </React.Suspense>
    </div>
  );
};
