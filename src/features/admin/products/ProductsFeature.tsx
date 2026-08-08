import React from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/common/LoadingState';
import { ProductCard } from './components/ProductCard';
import { ProductStatCards } from './components/ProductStatCards';
import { ProductFilter } from './components/ProductFilter';
import { useProducts } from './hooks/useProducts';
import { Package, Plus, RefreshCw, Clock } from 'lucide-react';

const ProductFormModal = React.lazy(() =>
  import('./components/ProductFormModal').then((m) => ({ default: m.ProductFormModal })),
);
const VariantFormModal = React.lazy(() =>
  import('./components/VariantFormModal').then((m) => ({ default: m.VariantFormModal })),
);
const ProductDetailModal = React.lazy(() =>
  import('./components/ProductDetailModal').then((m) => ({ default: m.ProductDetailModal })),
);
const BulkVariantGenerator = React.lazy(() =>
  import('./components/BulkVariantGenerator').then((m) => ({ default: m.BulkVariantGenerator })),
);

export const ProductsFeature: React.FC = () => {
  const { t } = useTranslation();

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    activeProducts,
    deletedProducts,
    categories,
    brands,
    metrics,
    isLoading,
    isRefreshing,
    refreshAll,

    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,

    detailProduct,
    setDetailProduct,

    isVariantModalOpen,
    setIsVariantModalOpen,
    editingVariant,
    targetProductId,

    isBulkVariantModalOpen,
    setIsBulkVariantModalOpen,
    bulkVariantProductId,
    bulkVariantCategoryName,

    handleOpenAddProduct,
    handleOpenEditProduct,
    handleProductSubmit,
    handleDeleteProductRequest,
    handleRestoreProductRequest,
    handleForceDeleteProductRequest,

    handleOpenAddVariant,
    handleOpenEditVariant,
    handleVariantSubmit,
    handleDeleteVariantRequest,
    handleToggleVariantStatus,
    handleInlineUpdateVariant,

    handleOpenBulkVariant,
    handleBulkVariantSubmit,

    ConfirmDialog,
  } = useProducts();

  const currentProductsList = activeTab === 'ACTIVE' ? activeProducts : deletedProducts;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-indigo-500" />
            {t('productManagement')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('productDesc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refreshAll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-xs font-semibold shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>

          <Button
            variant="primary"
            onClick={handleOpenAddProduct}
            className="gap-2 shadow-lg shadow-indigo-500/25 text-xs"
          >
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </Button>
        </div>
      </div>

      {/* Metric Stat Summary Cards */}
      <ProductStatCards metrics={metrics} />

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        {/* Search & Tab Filter Header */}
        <ProductFilter
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCount={metrics.activeProducts}
          deletedCount={metrics.deletedProductsCount}
        />

        {/* Trash Notice Banner */}
        {activeTab === 'DELETED' && (
          <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in duration-300">
            <Clock className="h-4 w-4 shrink-0" />
            {t('productTrashNotice30Days')}
          </div>
        )}

        {/* Product Cards Grid */}
        {isLoading ? (
          <LoadingState text={t('loadingProducts')} />
        ) : currentProductsList.length === 0 ? (
          <div className="py-16 text-center space-y-3 animate-in fade-in duration-300">
            <Package className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto stroke-1" />
            <h4 className="text-slate-700 dark:text-slate-300 font-bold text-base">
              {activeTab === 'ACTIVE' ? t('noProductsFound') : t('emptyTrash')}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'ACTIVE'
                ? t('noProductsSearchDesc')
                : t('emptyTrashDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentProductsList.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  isDeletedTab={activeTab === 'DELETED'}
                  onEditProduct={handleOpenEditProduct}
                  onDeleteProduct={handleDeleteProductRequest}
                  onRestoreProduct={handleRestoreProductRequest}
                  onForceDeleteProduct={handleForceDeleteProductRequest}
                  onViewDetail={(p) => setDetailProduct(p)}
                  onAddVariant={handleOpenAddVariant}
                  onEditVariant={(v) => handleOpenEditVariant(v.productId, v)}
                  onDeleteVariant={handleDeleteVariantRequest}
                  onToggleVariant={(v) => handleToggleVariantStatus(v.id, v.status)}
                  onBulkAddVariant={handleOpenBulkVariant}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lazy-loaded Modals */}
      <React.Suspense fallback={null}>
        {/* Create / Edit Product Modal */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSubmit={handleProductSubmit}
          editingProduct={editingProduct}
          categories={categories}
          brands={brands}
        />

        {/* Create / Edit Single Variant Modal */}
        <VariantFormModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          onSubmit={handleVariantSubmit}
          editingVariant={editingVariant}
          productId={targetProductId}
        />

        {/* Bulk Variant Generator Modal */}
        <BulkVariantGenerator
          isOpen={isBulkVariantModalOpen}
          onClose={() => setIsBulkVariantModalOpen(false)}
          onSubmit={handleBulkVariantSubmit}
          productId={bulkVariantProductId}
          categoryName={bulkVariantCategoryName}
        />

        {/* Detailed Product Modal */}
        <ProductDetailModal
          isOpen={Boolean(detailProduct)}
          onClose={() => setDetailProduct(null)}
          product={detailProduct}
          onAddVariant={handleOpenAddVariant}
          onEditVariant={(v) => handleOpenEditVariant(v.productId, v)}
          onToggleVariant={(v) => handleToggleVariantStatus(v.id, v.status)}
          onInlineUpdateVariant={handleInlineUpdateVariant}
          onBulkAddVariant={handleOpenBulkVariant}
        />
      </React.Suspense>

      {/* Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
};
