import React from 'react';
import {
  Scissors,
  Printer,
  Layers,
  Waves,
  BoxSelect,
  Cog,
  Sparkles,
  Flame,
  Stamp,
  Hand,
  CheckSquare,
  Package,
  Wrench,
  Truck,
  FileText,
  Boxes,
  HelpCircle,
} from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

export function renderStepIcon(iconName: string, props: IconProps = { className: 'w-4 h-4' }): React.ReactNode {
  switch (iconName) {
    case 'Scissors':
    case 'fa-scissors':
      return <Scissors {...props} />;
    case 'Printer':
    case 'fa-print':
      return <Printer {...props} />;
    case 'Layers':
    case 'fa-layer-group':
      return <Layers {...props} />;
    case 'Waves':
    case 'fa-water':
      return <Waves {...props} />;
    case 'BoxSelect':
    case 'fa-folder-open':
      return <BoxSelect {...props} />;
    case 'Cog':
    case 'fa-list-check':
    case 'fa-gears':
      return <Cog {...props} />;
    case 'Sparkles':
    case 'fa-wand-magic-sparkles':
      return <Sparkles {...props} />;
    case 'Flame':
    case 'fa-stamp':
      return <Flame {...props} />;
    case 'Stamp':
      return <Stamp {...props} />;
    case 'Hand':
    case 'fa-hand':
      return <Hand {...props} />;
    case 'CheckSquare':
    case 'fa-clipboard-check':
      return <CheckSquare {...props} />;
    case 'Package':
    case 'fa-boxes-packing':
    case 'fa-box':
      return <Package {...props} />;
    case 'Truck':
    case 'fa-truck':
    case 'fa-truck-fast':
      return <Truck {...props} />;
    case 'Boxes':
    case 'fa-boxes':
      return <Boxes {...props} />;
    case 'FileText':
    case 'fa-file-lines':
      return <FileText {...props} />;
    case 'Wrench':
      return <Wrench {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}
