import { PAGE_PAR_ITEM } from "../constants.js";

export const calcTotalPage = (value: number): number => {
  return Math.ceil(value / PAGE_PAR_ITEM);
};
