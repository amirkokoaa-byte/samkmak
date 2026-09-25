import type { MenuItem } from '../types/index.ts';

export function calculateRowPrice(
  itemType: string,
  count: number,
  weightText: string,
  menuItems: MenuItem[],
  _currentPrice?: number
): number {
  const menuItem = menuItems.find((m) => m.name === itemType);
  const basePrice = menuItem ? menuItem.pricePerKilo : 100;
  const isShrimp = itemType.includes('جمبري');

  if (!isShrimp) {
    return basePrice * count;
  }

  const w = (weightText || '').trim();
  if (w.includes('ربع') || w.includes('250')) {
    return Math.round(basePrice * 0.25 * count);
  }
  if (w.includes('نصف') || w.includes('500') || w.includes('نص')) {
    return Math.round(basePrice * 0.5 * count);
  }
  if (w.includes('كيلو') && !w.includes('نصف') && !w.includes('ربع')) {
    return basePrice * count;
  }

  return Math.round(basePrice * 0.5 * count);
}
