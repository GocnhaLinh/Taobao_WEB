import React from 'react';
import { Plus, Clock, Warehouse as WarehouseIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useWarehouses } from './hooks/useWarehouses';
import { WarehouseStats } from './components/WarehouseStats';
import { WarehouseFilter } from './components/WarehouseFilter';
import { WarehouseTable } from './components/WarehouseTable';

const WarehouseFormModal = React.lazy(() =>
  import('./components/WarehouseFormModal').then((m) => ({ default: m.WarehouseFormModal })),
);
const WarehouseConfirmModal = React.lazy(() =>
  import('./components/WarehouseConfirmModal').then((m) => ({ default: m.WarehouseConfirmModal })),
);

export const WarehousesFeature: React.FC = () => {
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
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    activeWarehouses,
    deletedWarehouses,
    paginatedWarehouses,
    totalPages,
    defaultWarehouse,
    supportedProvincesCount,
    isLoadingCurrent,
    isFormLoading,
    isConfirmLoading,
    isFormModalOpen,
    setIsFormModalOpen,
    editingWarehouse,
    confirmModalState,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
  } = useWarehouses();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <WarehouseIcon className="h-6 w-6 text-indigo-500" />
            {t('warehouseManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('warehouseManagementDesc')}
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden lg:inline">{t('addWarehouse')}</span>
          <span className="lg:hidden">{t('addWarehouseShort')}</span>
        </Button>
      </div>

      {/* Stats Cards Section */}
      <WarehouseStats
        totalActive={activeWarehouses.length}
        defaultWarehouseName={defaultWarehouse ? defaultWarehouse.name : 'Chưa thiết lập'}
        supportedProvincesCount={supportedProvincesCount}
        trashCount={deletedWarehouses.length}
      />

      {/* Main Glassmorphism Workspace */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Filter Bar */}
        <WarehouseFilter
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          activeCount={activeWarehouses.length}
          trashCount={deletedWarehouses.length}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortAsc={sortAsc}
          onSortAscToggle={() => setSortAsc((prev) => !prev)}
        />

        {/* Notice Banner for Recycle Bin */}
        {activeTab === 'TRASH' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <span>{t('warehouseTrashNotice')}</span>
          </div>
        )}

        {/* Warehouse List / Cards Grid & Pagination */}
        <WarehouseTable
          warehouses={paginatedWarehouses}
          activeTab={activeTab}
          viewMode={viewMode}
          searchQuery={searchQuery}
          isLoading={isLoadingCurrent}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={handleOpenEdit}
          onSoftDelete={(wh) => openConfirmModal(wh, 'SOFT_DELETE')}
          onRestore={(wh) => openConfirmModal(wh, 'RESTORE')}
          onHardDelete={(wh) => openConfirmModal(wh, 'HARD_DELETE')}
        />
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Form Modal */}
        <WarehouseFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingWarehouse}
          isLoading={isFormLoading}
        />

        {/* Confirm Modal */}
        <WarehouseConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          warehouse={confirmModalState.warehouse}
          type={confirmModalState.type}
          isLoading={isConfirmLoading}
        />
      </React.Suspense>
    </div>
  );
};
