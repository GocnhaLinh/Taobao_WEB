import React from 'react';
import { Award, Crown, Medal, Package, Sparkles, Trophy, User } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { useTranslation } from '../../../../lib/i18n';
import { formatCompactVND } from '../../../../utils/currencyHelper';
import type {
  RankingCardProps,
  RankingEmptyProps,
  RankingHeaderProps,
  RankingRowProps,
  TopBuyersLeaderboardProps,
  TopProductsLeaderboardProps,
} from '../types';
import { getAvatarInitial } from '../utils/dashboard.utils';

/* ------------------------------- shared pieces ------------------------------- */

const RankingCard: React.FC<RankingCardProps> = ({ children }) => (
  <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
    {children}
  </div>
);

const RankingHeader: React.FC<RankingHeaderProps> = ({
  icon,
  iconClass,
  title,
  badgeVariant,
  badgeIcon,
  badgeText,
  badgeTextShort,
}) => (
  <div className="flex items-center justify-between gap-2">
    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
      <span className={`h-5 w-5 shrink-0 ${iconClass}`}>{icon}</span>
      <span className="truncate">{title}</span>
    </h3>
    <Badge variant={badgeVariant} className="flex items-center gap-1 shrink-0 whitespace-nowrap">
      {badgeIcon}
      <span className="hidden sm:inline">{badgeText}</span>
      <span className="sm:hidden">{badgeTextShort}</span>
    </Badge>
  </div>
);

/** Podium medal badge — gradient circle (gold/silver/bronze) + white icon for the top 3, subtle number below. */
const RANK_BADGES = [
  {
    icon: Trophy,
    iconClass: 'text-white',
    badgeClass:
      'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 ring-amber-400/40 shadow-amber-500/40',
  },
  {
    icon: Medal,
    iconClass: 'text-slate-700',
    badgeClass:
      'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 ring-slate-300/50 shadow-slate-400/40',
  },
  {
    icon: Award,
    iconClass: 'text-white',
    badgeClass:
      'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 ring-orange-500/40 shadow-orange-600/40',
  },
];

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const podium = RANK_BADGES[rank];
  return (
    <div
      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center shadow-md ring-2 ${
        podium
          ? podium.badgeClass
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-white/10'
      }`}
    >
      {podium ? (
        <podium.icon
          className={`h-3.5 w-3.5 drop-shadow-sm ${podium.iconClass}`}
          strokeWidth={2.5}
        />
      ) : (
        <span className="text-[11px] font-extrabold">{rank + 1}</span>
      )}
    </div>
  );
};

const RankingEmpty: React.FC<RankingEmptyProps> = ({ icon, label }) => (
  <div className="text-center py-8 space-y-2">
    {icon}
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

const RankingRow: React.FC<RankingRowProps> = ({
  rank,
  media,
  title,
  subtitle,
  rightTop,
  rightBottom,
}) => (
  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all group gap-2">
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
      <RankBadge rank={rank} />
      {media}
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-indigo-500 transition-colors">
          {title}
        </h4>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
          {subtitle}
        </span>
      </div>
    </div>
    <div className="text-right shrink-0">
      {rightTop}
      {rightBottom}
    </div>
  </div>
);

/* ------------------------------ top products board ------------------------------ */

export const TopProductsLeaderboard: React.FC<TopProductsLeaderboardProps> = ({ products }) => {
  const { t } = useTranslation();

  return (
    <RankingCard>
      <RankingHeader
        icon={<Crown className="h-5 w-5" />}
        iconClass="text-amber-500"
        title={t('topProductsTitle')}
        badgeVariant="warning"
        badgeIcon={<Sparkles className="h-3 w-3" />}
        badgeText={t('topBestsellers')}
        badgeTextShort={t('topFive')}
      />

      {products.length === 0 ? (
        <RankingEmpty
          icon={
            <Package className="h-10 w-10 mx-auto stroke-1 text-slate-400 dark:text-slate-600" />
          }
          label={t('emptyTopProducts')}
        />
      ) : (
        <div className="space-y-3">
          {products.map((prod, idx) => (
            <RankingRow
              key={prod.productId || prod.productName || idx}
              rank={idx}
              media={
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-white/10">
                  {prod.thumbnail ? (
                    <img
                      src={prod.thumbnail}
                      alt={prod.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  )}
                </div>
              }
              title={prod.productName}
              subtitle={prod.category || '—'}
              rightTop={
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block">
                  {formatCompactVND(prod.revenue)} ₫
                </span>
              }
              rightBottom={
                <span className="text-[10px] text-emerald-500 font-semibold block">
                  {prod.quantitySold} {t('soldUnit')}
                </span>
              }
            />
          ))}
        </div>
      )}
    </RankingCard>
  );
};

/* ------------------------------ top buyers board ------------------------------ */

export const TopBuyersLeaderboard: React.FC<TopBuyersLeaderboardProps> = ({ buyers }) => {
  const { t } = useTranslation();

  return (
    <RankingCard>
      <RankingHeader
        icon={<Award className="h-5 w-5" />}
        iconClass="text-indigo-500"
        title={t('topBuyersTitle')}
        badgeVariant="info"
        badgeText={t('topBuyersBadge')}
        badgeTextShort={t('topShort')}
      />

      {buyers.length === 0 ? (
        <RankingEmpty
          icon={<User className="h-10 w-10 mx-auto stroke-1 text-slate-400 dark:text-slate-600" />}
          label={t('emptyTopBuyers')}
        />
      ) : (
        <div className="space-y-3">
          {buyers.map((buyer, idx) => (
            <RankingRow
              key={buyer.userId}
              rank={idx}
              media={
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 shadow-sm bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  {buyer.avatar ? (
                    <img
                      src={buyer.avatar}
                      alt={buyer.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {getAvatarInitial(buyer.fullName)}
                    </span>
                  )}
                </div>
              }
              title={buyer.fullName}
              subtitle={buyer.email || '—'}
              rightTop={
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {buyer.totalSpent.toLocaleString('vi-VN')} ₫
                </span>
              }
              rightBottom={
                <span className="text-[10px] text-indigo-500 font-semibold block">
                  {buyer.ordersCount} {t('ordersUnit')}
                </span>
              }
            />
          ))}
        </div>
      )}
    </RankingCard>
  );
};
