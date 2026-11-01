import type { Employee } from "../types";
import { makeEmployee } from "./sampleData";
const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
/** Employee numbers match the supplied payroll sheet; 7 and 12 have no assigned station. */
export const KYO_EMPLOYEE_DETAILS: Record<number, {name:string; hourlyRate:number; hours:number}> = {
 1:{name:"Van Lam, Hoang",hourlyRate:16.80,hours:160},
 2:{name:"Ngoc Toan, Nguyen",hourlyRate:14.00,hours:100},
 3:{name:"Nguyen The Anh",hourlyRate:13.90,hours:120},
 4:{name:"Dau Trong, Loc",hourlyRate:13.90,hours:120},
 5:{name:"Xuan Thuong, Le",hourlyRate:17.81,hours:170},
 6:{name:"Trong Khoi, Pham",hourlyRate:13.90,hours:5},
 8:{name:"Scelsi Fabio Noel",hourlyRate:13.90,hours:28},
 9:{name:"Dinh Dat, Le",hourlyRate:13.90,hours:15},
 10:{name:"Anh Nguyet, Pham",hourlyRate:13.90,hours:20},
 11:{name:"Peker Arda",hourlyRate:13.90,hours:25},
 13:{name:"Tasev Kosta",hourlyRate:13.90,hours:20},
 14:{name:"Hoang Thi Dieu Linh",hourlyRate:13.90,hours:20},
 15:{name:"Phuong Uyen Tran",hourlyRate:13.90,hours:20},
 16:{name:"Thi My Hanh Quach",hourlyRate:17.50,hours:120},
 17:{name:"Ngoc Chieu Kha, Do",hourlyRate:15.10,hours:5},
 18:{name:"Hoang Quynh Nhu, Nguyen",hourlyRate:16.80,hours:120},
 19:{name:"Minh Kha, Nguyen",hourlyRate:17.81,hours:160},
};
export function kyoEmployees(): Employee[] {
 const kitchen=[1,2,3,4,5], service=[16,19,18,6,10,14,15,17], drivers=[8,9,11,13];
 return [...kitchen,...service,...drivers].map(n => {
  const driver=drivers.includes(n), station=driver?"DRIVER":kitchen.includes(n)?"KITCHEN":"SERVICE";
  return {...makeEmployee(`kyo-${n}`,KYO_EMPLOYEE_DETAILS[n].name,driver?"MINIJOB":"VOLLZEIT",KYO_EMPLOYEE_DETAILS[n].hours),
   hourlyRate:KYO_EMPLOYEE_DETAILS[n].hourlyRate,
   station,role:driver?"Tài xế":station==="KITCHEN"?"Bếp":"Bồi",quotaSource:"hours",
   preferredWindows:driver?[{days:[...DAYS],startMinutes:1080,endMinutes:1260}]:undefined} satisfies Employee;
 });
}
