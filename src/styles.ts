export const navBarHeight = "3.5rem";
export const footerHeight = "2rem";
export const bodyPaddingX = "48px";
export const bodyHeight = `calc(100vh - ${navBarHeight} - ${footerHeight})`;
export function bodyHeightPercentage(percentage: number) {
  return `calc(${percentage * 100}vh - ${navBarHeight} - ${footerHeight})`;
}
export function bodyHeightOffset(offset: number) {
  return `calc(100vh - ${navBarHeight} - ${footerHeight} - ${offset}px)`;
}
