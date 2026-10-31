import {expect,it} from "vitest";
import {hourStatsFor} from "../surchargeHours";
import {minutesOutsidePreferred} from "../preferredWindows";
import {validateSchedule} from "../validation";
import type {Shift} from "../../types";
const shift=(patch:Partial<Shift>={}):Shift=>({id:"s",employeeId:"e",date:"2027-01-01",startMinutes:1080,endMinutes:1320,pauseMinutes:0,paidMinutes:240,shiftType:"LATE",generated:true,...patch});
it("paid night/preference hours exclude pauses and merge overlapping windows",()=>{
 const s=shift({startMinutes:1080,endMinutes:1320,pauseMinutes:30,pauseStartMinutes:1200,paidMinutes:210});
 expect(hourStatsFor([s],"e",[s.date])).toEqual({total:210,night:90,sunday:0});
 expect(minutesOutsidePreferred([{days:["friday"],startMinutes:1080,endMinutes:1200},{days:["friday"],startMinutes:1140,endMinutes:1230}],"friday",s)).toBe(90);
 const sun=shift({date:"2027-01-03"});
 expect(hourStatsFor([sun],"e",[sun.date])).toEqual({total:240,night:0,sunday:240});
});
it("even one minute over a monthly quota is an error",()=>{
 const e={id:"e",name:"E",employmentType:"MINIJOB" as const,targetMinutes:239};
 expect(validateSchedule([e],[shift()],2027,["2027-01-01"]).errors.some(e=>e.rule==="contract-max")).toBe(true);
});
