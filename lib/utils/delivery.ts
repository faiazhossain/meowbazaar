import { getDeliveryFee as getDeliveryFeeAction } from "@/lib/actions/settings";

export interface DeliveryFeeResult {
  fee: number;
  isFree: boolean;
  thresholdReached: boolean;
  amountToFree?: number;
  discount?: number;
  discountPercentage?: number;
  threshold: number;
  standardFee: number;
}

/**
 * Calculate delivery fee based on subtotal and division
 * Returns a comprehensive result for UI components
 */
export async function calculateDeliveryFee(
  subtotal: number,
  division?: string
): Promise<DeliveryFeeResult> {
  const result = await getDeliveryFeeAction(subtotal, division);
  const settings = await getDeliverySettings(division);

  const thresholdReached = subtotal >= settings.freeDeliveryThreshold;
  const amountToFree = thresholdReached
    ? undefined
    : settings.freeDeliveryThreshold - subtotal;

  return {
    fee: result.fee,
    isFree: result.isFree,
    thresholdReached,
    amountToFree: amountToFree ? Math.max(0, amountToFree) : undefined,
    discount: result.discount,
    discountPercentage: result.discountPercentage,
    threshold: settings.freeDeliveryThreshold,
    standardFee: settings.standardDeliveryFee,
  };
}

/**
 * Helper function to get delivery settings
 */
async function getDeliverySettings(division?: string) {
  try {
    const response = await fetch("/api/delivery-settings", {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
  }

  // Return default values
  return {
    freeDeliveryThreshold: 500,
    standardDeliveryFee: 60,
    freeDeliveryType: "FREE" as const,
    discountPercentage: null,
  };
}

/**
 * Format delivery message based on result and locale
 */
export function formatDeliveryMessage(
  result: DeliveryFeeResult,
  locale: string = "bn"
): string {
  const t = getDeliveryTranslations(locale);

  if (result.thresholdReached) {
    if (result.discountPercentage && result.discountPercentage > 0) {
      return t.discountApplied.replace("{discount}", result.discountPercentage.toString());
    }
    return t.thresholdReached;
  }

  if (result.amountToFree) {
    return t.amountToFree.replace("{amount}", formatCurrency(result.amountToFree, locale));
  }

  return t.thresholdFree.replace("{threshold}", formatCurrency(result.threshold, locale));
}

/**
 * Format delivery fee for display
 */
export function formatDeliveryFee(
  result: DeliveryFeeResult,
  locale: string = "bn"
): string {
  const t = getDeliveryTranslations(locale);

  if (result.fee === 0) {
    if (result.discountPercentage && result.discountPercentage === 100) {
      return `${t.free} (${t.discountApplied.replace("{discount}", "100")})`;
    }
    return t.free;
  }

  if (result.discountPercentage && result.discountPercentage > 0) {
    const discounted = formatCurrency(result.fee, locale);
    const original = formatCurrency(result.standardFee, locale);
    return `${discounted} <span class="text-muted-foreground line-through text-xs ml-1">${original}</span>`;
  }

  return `${t.charge}: ${formatCurrency(result.fee, locale)}`;
}

/**
 * Get delivery translations for a locale
 */
function getDeliveryTranslations(locale: string) {
  const translations: Record<string, any> = {
    bn: {
      free: "ফ্রি",
      charge: "ডেলিভারি চার্জ",
      thresholdFree: "৳{threshold}+ অর্ডারে",
      amountToFree: "৳{amount} আরও কিনলে ফ্রি ডেলিভারি!",
      thresholdReached: "ফ্রি ডেলিভারি পেয়েছেন!",
      discountApplied: "{discount}% ছাড় পেয়েছেন!",
    },
    en: {
      free: "Free",
      charge: "Delivery Charge",
      thresholdFree: "On orders ৳{threshold}+",
      amountToFree: "Buy ৳{amount} more for free delivery!",
      thresholdReached: "You've got free delivery!",
      discountApplied: "You got {discount}% off!",
    },
  };

  return translations[locale] || translations.bn;
}

/**
 * Format currency based on locale
 */
function formatCurrency(amount: number, locale: string = "bn"): string {
  if (locale === "en") {
    return `৳${Math.round(amount).toLocaleString()}`;
  }
  return `৳${Math.round(amount).toLocaleString("bn-BD")}`;
}
