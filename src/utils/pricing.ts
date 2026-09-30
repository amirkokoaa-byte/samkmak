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
  const isMacaroni = itemType.includes('مكرونه') || itemType.includes('مكرونة');

  if (isShrimp) {
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
    const gramsMatch = w.match(/(\d+)/);
    if (gramsMatch) {
      const grams = parseInt(gramsMatch[1], 10);
      if (!isNaN(grams) && grams > 0) {
        return Math.round(basePrice * (grams / 1000) * count);
      }
    }
    return Math.round(basePrice * 0.5 * count);
  }

  if (isMacaroni) {
    const w = (weightText || '').trim();
    if (w.includes('كيلو') && !w.includes('نصف') && !w.includes('ربع')) {
      return basePrice * count;
    }
    if (w.includes('نصف') || w.includes('نص')) {
      return Math.round(basePrice * 0.5 * count);
    }
    if (w.includes('ربع')) {
      return Math.round(basePrice * 0.25 * count);
    }
    const gramsMatch = w.match(/(\d+)/);
    if (gramsMatch) {
      const grams = parseInt(gramsMatch[1], 10);
      if (!isNaN(grams) && grams > 0) {
        return Math.round(basePrice * (grams / 1000) * count);
      }
    }
    // Default to 500g (half kilo) if unspecified
    return Math.round(basePrice * 0.5 * count);
  }

  return basePrice * count;
}
