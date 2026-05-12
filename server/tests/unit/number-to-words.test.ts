import { numberToVietnameseWords } from "../../src/utils/number-to-words";

describe("numberToVietnameseWords", () => {
  it("should convert 0 to 'Không đồng'", () => {
    expect(numberToVietnameseWords(0)).toBe("Không đồng");
  });

  it("should convert single digit numbers", () => {
    expect(numberToVietnameseWords(5)).toBe("Năm đồng");
  });

  it("should convert tens", () => {
    expect(numberToVietnameseWords(10)).toBe("Mười đồng");
    expect(numberToVietnameseWords(15)).toBe("Mười lăm đồng");
    expect(numberToVietnameseWords(21)).toBe("Hai mươi mốt đồng");
    expect(numberToVietnameseWords(44)).toBe("Bốn mươi tư đồng");
    expect(numberToVietnameseWords(55)).toBe("Năm mươi lăm đồng");
  });

  it("should convert hundreds", () => {
    expect(numberToVietnameseWords(100)).toBe("Một trăm đồng");
    expect(numberToVietnameseWords(105)).toBe("Một trăm lẻ năm đồng");
    expect(numberToVietnameseWords(999)).toBe("Chín trăm chín mươi chín đồng");
  });

  it("should convert thousands", () => {
    expect(numberToVietnameseWords(1000)).toBe("Một nghìn đồng");
    expect(numberToVietnameseWords(1500)).toBe("Một nghìn năm trăm đồng");
    expect(numberToVietnameseWords(10000)).toBe("Mười nghìn đồng");
  });

  it("should convert millions", () => {
    expect(numberToVietnameseWords(1000000)).toBe("Một triệu đồng");
    expect(numberToVietnameseWords(1500000)).toBe("Một triệu năm trăm nghìn đồng");
  });

  it("should convert typical receipt amounts", () => {
    const result = numberToVietnameseWords(2450000);
    expect(result).toContain("triệu");
    expect(result).toContain("đồng");
  });

  it("should handle negative numbers", () => {
    const result = numberToVietnameseWords(-1000);
    expect(result).toContain("Âm");
    expect(result).toContain("đồng");
  });

  it("should handle large numbers (billions)", () => {
    const result = numberToVietnameseWords(1000000000);
    expect(result).toContain("tỷ");
    expect(result).toContain("đồng");
  });
});
