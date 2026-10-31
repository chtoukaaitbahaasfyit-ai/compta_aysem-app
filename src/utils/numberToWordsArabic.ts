/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Conversion des montants en chiffres en toutes lettres (Arabe & Français)
 * Conforme aux usages bancaires et administratifs marocains (Dirham Marocain / السنتيم)
 */

const ONES_AR = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS_AR = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const TENS_AR = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS_AR = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertUnderThousandAr(n: number): string {
  if (n === 0) return '';
  const parts: string[] = [];

  const h = Math.floor(n / 100);
  const rem = n % 100;

  if (h > 0) {
    parts.push(HUNDREDS_AR[h]);
  }

  if (rem > 0) {
    if (rem < 10) {
      parts.push(ONES_AR[rem]);
    } else if (rem < 20) {
      parts.push(TEENS_AR[rem - 10]);
    } else {
      const u = rem % 10;
      const t = Math.floor(rem / 10);
      if (u > 0) {
        parts.push(`${ONES_AR[u]} و${TENS_AR[t]}`);
      } else {
        parts.push(TENS_AR[t]);
      }
    }
  }

  return parts.join(' و');
}

export function numberToArabicWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'صفر درهم مغربي';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const dirhams = Math.floor(absAmount);
  const centimes = Math.round((absAmount - dirhams) * 100);

  const parts: string[] = [];

  const millions = Math.floor(dirhams / 1000000);
  const thousands = Math.floor((dirhams % 1000000) / 1000);
  const remainder = dirhams % 1000;

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions <= 10) parts.push(`${convertUnderThousandAr(millions)} ملايين`);
    else parts.push(`${convertUnderThousandAr(millions)} مليون`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands <= 10) parts.push(`${convertUnderThousandAr(thousands)} آلاف`);
    else parts.push(`${convertUnderThousandAr(thousands)} ألف`);
  }

  if (remainder > 0) {
    parts.push(convertUnderThousandAr(remainder));
  }

  let result = (isNegative ? 'سالب ' : '') + parts.join(' و') + ' درهم مغربي';

  if (centimes > 0) {
    result += ` و${convertUnderThousandAr(centimes)} سنتيم`;
  }

  return result.trim();
}

const ONES_FR = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const TEENS_FR = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS_FR = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

function convertUnderHundredFr(n: number): string {
  if (n < 10) return ONES_FR[n];
  if (n < 20) return TEENS_FR[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7) {
    return `soixante-${TEENS_FR[u]}`;
  }
  if (t === 8) {
    return u === 0 ? 'quatre-vingts' : `quatre-vingt-${ONES_FR[u]}`;
  }
  if (t === 9) {
    return `quatre-vingt-${TEENS_FR[u]}`;
  }
  if (u === 1 && t < 7) {
    return `${TENS_FR[t]} et un`;
  }
  return u === 0 ? TENS_FR[t] : `${TENS_FR[t]}-${ONES_FR[u]}`;
}

function convertUnderThousandFr(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const rem = n % 100;
  let res = '';
  if (h === 1) res = 'cent';
  else if (h > 1) res = `${ONES_FR[h]} cent${rem === 0 ? 's' : ''}`;

  if (rem > 0) {
    res = res ? `${res} ${convertUnderHundredFr(rem)}` : convertUnderHundredFr(rem);
  }
  return res;
}

export function numberToFrenchWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'zéro Dirham';

  const absAmount = Math.abs(amount);
  const dirhams = Math.floor(absAmount);
  const centimes = Math.round((absAmount - dirhams) * 100);

  const parts: string[] = [];
  const millions = Math.floor(dirhams / 1000000);
  const thousands = Math.floor((dirhams % 1000000) / 1000);
  const remainder = dirhams % 1000;

  if (millions > 0) {
    parts.push(`${convertUnderThousandFr(millions)} million${millions > 1 ? 's' : ''}`);
  }
  if (thousands > 0) {
    if (thousands === 1) parts.push('mille');
    else parts.push(`${convertUnderThousandFr(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(convertUnderThousandFr(remainder));
  }

  let text = parts.join(' ') + ' Dirhams marocains';
  if (centimes > 0) {
    text += ` et ${convertUnderHundredFr(centimes)} centimes`;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}
