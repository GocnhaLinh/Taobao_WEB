import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { ConfirmModal } from '../../../../components/ui/ConfirmModal';
import { Package } from 'lucide-react';
import { useBulkVariantGenerator } from '../hooks/useBulkVariantGenerator';
import type { BulkVariantGeneratorProps } from '../types/bulk-variant.types';
import { BulkVariantSystemBar } from './bulk-variant/BulkVariantSystemBar';
import { SizeColorConfigSection } from './bulk-variant/SizeColorConfigSection';
import { SizePriceWeightTable } from './bulk-variant/SizePriceWeightTable';
import { CommonValuesCalculator } from './bulk-variant/CommonValuesCalculator';
import { VariantPreviewList } from './bulk-variant/VariantPreviewList';

export const BulkVariantGenerator: React.FC<BulkVariantGeneratorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  productId,
  categoryName,
  existingVariants,
}) => {
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const {
    t,
    sizes,
    sizeInput,
    setSizeInput,
    sizePrices,
    sizeOriginalPrices,
    sizeWeights,
    colors,
    colorInput,
    setColorInput,
    colorImages,
    setColorImages,
    commonPrice,
    setCommonPrice,
    commonOriginalPriceCNY,
    setCommonOriginalPriceCNY,
    commonWeight,
    setCommonWeight,
    commonStock,
    setCommonStock,
    exchangeRate,
    shippingFeePerKg,
    duplicateErrors,
    fileInputRefs,
    allWeightsSet,
    rate,
    perKg,
    calcProfit,
    generatedVariants,
    addSize,
    removeSize,
    updateSizePrice,
    updateSizeOriginalPrice,
    updateSizeWeight,
    clearSizeCustomValues,
    addColor,
    removeColor,
    handleUploadColorImage,
    handleRemoveColorImage,
    handleSubmit,
    cleanupSessionImages,
    hasUploadedImages,
    totalVariants,
    hasSizeOrColor,
    customCounts,
    hideCommonPriceSection,
    uploadingColors,
    DIGITS_ONLY,
    DECIMAL_INPUT,
  } = useBulkVariantGenerator({
    isOpen,
    onClose,
    onSubmit,
    productId,
    categoryName,
    existingVariants,
  });

  const handleAttemptClose = () => {
    if (hasUploadedImages()) {
      setIsCancelConfirmOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title={t('bulkVariantTitle') || '📊 Create Bulk Variants'}
        maxWidth="4xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleAttemptClose} disabled={isLoading}>
              {t('cancel')}
            </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            onClick={handleSubmit}
            disabled={totalVariants === 0}
            className="flex items-center gap-1.5"
          >
            <Package className="h-4 w-4" />
            {t('bulkCreateVariantsBtn', { count: totalVariants })}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <BulkVariantSystemBar
          exchangeRate={exchangeRate}
          shippingFeePerKg={shippingFeePerKg}
          duplicateErrors={duplicateErrors}
        />

        <SizeColorConfigSection
          sizes={sizes}
          sizeInput={sizeInput}
          setSizeInput={setSizeInput}
          addSize={addSize}
          removeSize={removeSize}
          colors={colors}
          colorInput={colorInput}
          setColorInput={setColorInput}
          addColor={addColor}
          removeColor={removeColor}
          colorImages={colorImages}
          setColorImages={setColorImages}
          fileInputRefs={fileInputRefs}
          handleUploadColorImage={handleUploadColorImage}
          handleRemoveColorImage={handleRemoveColorImage}
          uploadingColors={uploadingColors}
        />

        <SizePriceWeightTable
          sizes={sizes}
          sizePrices={sizePrices}
          sizeOriginalPrices={sizeOriginalPrices}
          sizeWeights={sizeWeights}
          commonPrice={commonPrice}
          commonOriginalPriceCNY={commonOriginalPriceCNY}
          commonWeight={commonWeight}
          updateSizePrice={updateSizePrice}
          updateSizeOriginalPrice={updateSizeOriginalPrice}
          updateSizeWeight={updateSizeWeight}
          clearSizeCustomValues={clearSizeCustomValues}
          calcProfit={calcProfit}
          customCounts={customCounts}
        />

        <CommonValuesCalculator
          hideCommonPriceSection={hideCommonPriceSection}
          commonPrice={commonPrice}
          setCommonPrice={setCommonPrice}
          commonOriginalPriceCNY={commonOriginalPriceCNY}
          setCommonOriginalPriceCNY={setCommonOriginalPriceCNY}
          allWeightsSet={allWeightsSet}
          commonWeight={commonWeight}
          setCommonWeight={setCommonWeight}
          commonStock={commonStock}
          setCommonStock={setCommonStock}
          perKg={perKg}
          rate={rate}
          DIGITS_ONLY={DIGITS_ONLY}
          DECIMAL_INPUT={DECIMAL_INPUT}
        />

        <VariantPreviewList
          totalVariants={totalVariants}
          hasSizeOrColor={hasSizeOrColor}
          generatedVariants={generatedVariants}
          commonPrice={commonPrice}
        />
      </form>
    </Modal>

    <ConfirmModal
      isOpen={isCancelConfirmOpen}
      onClose={() => setIsCancelConfirmOpen(false)}
      onConfirm={async () => {
        setIsCancelConfirmOpen(false);
        await cleanupSessionImages();
        onClose();
      }}
      title={t('confirmCancelTitle') || 'Xác nhận hủy thay đổi'}
      description={t('confirmCancelDesc') || 'Bạn có các thay đổi hoặc ảnh vừa tải lên chưa lưu. Tất cả ảnh chưa lưu sẽ tự động bị xóa khỏi Cloudinary.'}
      confirmText={t('confirmCancelBtn') || 'Hủy thay đổi'}
      cancelText={t('keepEditingBtn') || 'Tiếp tục chỉnh sửa'}
      variant="warning"
    />
  </>
  );
};
