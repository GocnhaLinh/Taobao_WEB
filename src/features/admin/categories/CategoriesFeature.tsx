import React from 'react';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useCategories } from './hooks/useCategories';
import { CategoryFilter } from './components/CategoryFilter';
import { CategoryTable } from './components/CategoryTable';

const CategoryFormModal = React.lazy(() =>
  import('./components/CategoryFormModal').then((m) => ({ default: m.CategoryFormModal })),
);
const CategoryConfirmModal = React.lazy(() =>
  import('./components/CategoryConfirmModal').then((m) => ({ default: m.CategoryConfirmModal })),
);

export const CategoriesFeature: React.FC = () => {
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
    activeCategories,
    deletedCategories,
    labelsMap,
    paginatedCategories,
    totalPages,
    isLoadingCurrent,
    isFormLoading,
    isConfirmLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    editingCategory,
    confirmModalState,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
    invalidateLabelQueries,
  } = useCategories();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            {t('productCategories')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('manageCategories')}
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden lg:inline">{t('addCategory')}</span>
          <span className="lg:hidden">{t('addShort')}</span>
        </Button>
      </div>

      {/* Main Glassmorphism Workspace */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Filter bar */}
        <CategoryFilter
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          activeCount={activeCategories.length}
          trashCount={deletedCategories.length}
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
            <span>{t('trashNoticeBanner')}</span>
          </div>
        )}

        {/* Categories List / Cards Grid & Pagination */}
        <CategoryTable
          categories={paginatedCategories}
          labelsMap={labelsMap}
          activeTab={activeTab}
          viewMode={viewMode}
          isLoading={isLoadingCurrent}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={handleOpenEdit}
          onSoftDelete={(c) => openConfirmModal(c, 'SOFT_DELETE')}
          onRestore={(c) => openConfirmModal(c, 'RESTORE')}
          onHardDelete={(c) => openConfirmModal(c, 'HARD_DELETE')}
        />
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Form Modal (Add & Edit) */}
        <CategoryFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingCategory}
          defaultSex="UNISEX"
          isLoading={isFormLoading}
          onLabelsChanged={invalidateLabelQueries}
        />

        {/* Confirmation Modal (Soft Delete, Restore, Hard Delete) */}
        <CategoryConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          category={confirmModalState.category}
          type={confirmModalState.type}
          isLoading={isConfirmLoading}
        />
      </React.Suspense>
    </div>
  );
};
