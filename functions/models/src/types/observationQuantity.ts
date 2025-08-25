import { type QuantityUnit } from "../codes/quantityUnit.js";

export interface ObservationQuantity {
  date: Date;
  value: number;
  unit: QuantityUnit;
}
