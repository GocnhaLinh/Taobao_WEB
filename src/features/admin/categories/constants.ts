import type { SexType } from './types';

export const SEX_OPTIONS: { label: string; value: SexType }[] = [
  { label: 'Unisex', value: 'UNISEX' },
  { label: 'Nam (Male)', value: 'MALE' },
  { label: 'Nữ (Female)', value: 'FEMALE' },
  { label: 'Trẻ em (Kid)', value: 'KID' },
  { label: 'Khác (Other)', value: 'OTHER' },
];

export const PAGE_SIZE_ROW = 10;
export const PAGE_SIZE_CARD = 8;
