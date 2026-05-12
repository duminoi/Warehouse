/**
 * Chuyển số thành chữ tiếng Việt
 * Ví dụ: 1500000 → "Một triệu năm trăm nghìn đồng"
 */

const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function readGroup(hundreds: number, tens: number, units: number, showZeroHundred: boolean): string {
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(`${DIGITS[hundreds]} trăm`);
  } else if (showZeroHundred) {
    parts.push("không trăm");
  }

  if (tens === 0 && units === 0) {
    return parts.join(" ");
  }

  if (tens === 0) {
    if (hundreds > 0 || showZeroHundred) {
      parts.push("lẻ");
    }
    parts.push(DIGITS[units]);
  } else if (tens === 1) {
    parts.push("mười");
    if (units === 5) {
      parts.push("lăm");
    } else if (units > 0) {
      parts.push(DIGITS[units]);
    }
  } else {
    parts.push(`${DIGITS[tens]} mươi`);
    if (units === 1) {
      parts.push("mốt");
    } else if (units === 4) {
      parts.push("tư");
    } else if (units === 5) {
      parts.push("lăm");
    } else if (units > 0) {
      parts.push(DIGITS[units]);
    }
  }

  return parts.join(" ");
}

const UNITS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

export function numberToVietnameseWords(amount: number): string {
  if (amount === 0) {
    return "Không đồng";
  }

  if (amount < 0) {
    return `Âm ${numberToVietnameseWords(Math.abs(amount))}`;
  }

  // Round to integer
  const intAmount = Math.round(amount);
  const amountStr = intAmount.toString();

  // Pad to multiple of 3
  const padded = amountStr.padStart(Math.ceil(amountStr.length / 3) * 3, "0");

  // Split into groups of 3
  const groups: number[][] = [];
  for (let i = 0; i < padded.length; i += 3) {
    const group = padded.substring(i, i + 3);
    groups.push([parseInt(group[0], 10), parseInt(group[1], 10), parseInt(group[2], 10)]);
  }

  const parts: string[] = [];
  const totalGroups = groups.length;

  for (let i = 0; i < totalGroups; i++) {
    const [hundreds, tens, units] = groups[i];
    const unitIndex = totalGroups - 1 - i;

    if (hundreds === 0 && tens === 0 && units === 0) {
      continue;
    }

    const showZeroHundred = i > 0 && parts.length > 0;
    const groupText = readGroup(hundreds, tens, units, showZeroHundred);
    const unitText = UNITS[unitIndex] || "";

    parts.push(unitText ? `${groupText} ${unitText}` : groupText);
  }

  const result = parts.join(" ");

  // Capitalize first letter and add "đồng"
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}
