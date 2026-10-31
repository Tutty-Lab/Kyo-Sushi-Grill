import type { Employee } from "../types";
import { makeEmployee } from "./sampleData";
const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
export function kyoEmployees(): Employee[] {
 const kitchen=[1,2,3,4,5], service=[16,19,18,6,10,14,15,17], drivers=[8,9,11,13];
 return [...kitchen,...service,...drivers].map(n => {
  const driver=drivers.includes(n), station=driver?"DRIVER":kitchen.includes(n)?"KITCHEN":"SERVICE";
  return {...makeEmployee(`kyo-${n}`,`Nhân viên ${n}`,driver?"MINIJOB":"VOLLZEIT",driver?43:160),
   station,role:driver?"Tài xế":station==="KITCHEN"?"Bếp":"Bồi",quotaSource:"hours",
   preferredWindows:driver?[{days:[...DAYS],startMinutes:1020,endMinutes:1320}]:undefined} satisfies Employee;
 });
}
