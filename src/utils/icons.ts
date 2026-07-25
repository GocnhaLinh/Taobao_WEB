/**
 * Centralized Icon Manager
 * All Lucide icons are imported and re-exported from here to optimize bundling,
 * reduce duplicated module imports, and provide dynamic icon resolution.
 */
import React from 'react';
import * as LucideIcons from 'lucide-react';

export {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  Warehouse as WarehouseIcon,
  Receipt,
  Users,
  Ticket,
  Star,
  MessageCircle,
  Settings,
  ChevronDown,
  X,
  Boxes,
  ShoppingCart,
  Sparkles,
  Home,
  RefreshCw,
  Unplug,
  ZapOff,
  AlertTriangle,
  Info,
  Trash2,
  CheckCircle,
  CheckCircle2,
  Search,
  Plus,
  Tag,
  Percent,
  Calculator,
  Power,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Archive,
  Building2,
  LayoutGrid,
  List,
  Navigation,
  UserCheck,
  ShieldAlert,
  UserPlus,
  Edit2,
  RotateCcw,
  MapPin,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Sliders,
  Save,
  Moon,
  Sun,
  Truck,
  Globe,
  DollarSign,
  Copy,
  Check,
  Edit3,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Crown,
  Eye,
  CreditCard,
  CheckCheck,
  Send,
  XCircle,
  Volume2,
  VolumeX,
  Menu,
  Loader2,
  Heart,
  Activity,
} from 'lucide-react';

/**
 * Dynamic Icon Component Helper
 * Resolves a Lucide icon component by string name.
 */
export interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 20, className = '', ...props }) => {
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[name] || LucideIcons.HelpCircle;
  return React.createElement(IconComponent, { size, className, ...props });
};
