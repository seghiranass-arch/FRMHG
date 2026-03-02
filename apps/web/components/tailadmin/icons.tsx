import * as React from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Package, 
  Trophy, 
  Heart, 
  PieChart, 
  Settings, 
  MessageCircle, 
  FileSearch,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  Grid3X3
} from 'lucide-react';

type IconProps = React.SVGProps<SVGSVGElement>;

// Map Lucide icons to our existing icon names for backward compatibility
export const GridIcon = Grid3X3;
export const CalenderIcon = Calendar;
export const ChevronDownIcon = ChevronDown;
export const HorizontaLDots = MoreHorizontal;

// Modern icons for FRMHG platform
export const DashboardIcon = LayoutDashboard;
export const UsersIcon = Users;
export const LicenseIcon = FileText;
export const PaymentIcon = CreditCard;
export const EquipmentIcon = Package;
export const CompetitionIcon = Trophy;
export const MedicalIcon = Heart;
export const FinanceIcon = PieChart;
export const SettingsIcon = Settings;
export const CommunicationIcon = MessageCircle;
export const AuditIcon = FileSearch;








