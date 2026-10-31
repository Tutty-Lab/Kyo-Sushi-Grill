import {it,expect} from "vitest";
import {STORES,initialScheduleFor} from "../stores";
import {generateSchedule} from "../scheduler";
import {datesOfMonth} from "../demand";
import {staffAt} from "../staffing";
import {checkShifts} from "../shiftChecks";
it("drivers fill evening coverage before stacking peak shifts",()=>{
 const store=STORES[0],base=initialScheduleFor(store);
 const s={...base,employees:base.employees.filter(e=>e.station==="DRIVER").map(e=>({...e,targetMinutes:43*60}))};
 const shifts=generateSchedule({...s,rules:store.staffingRules,weights:store.dayWeights,demandProfile:store.demandProfile,storeTag:store.id});
 const employees=new Map(s.employees.map(e=>[e.id,e]));
 let missing=0;
 for(const date of datesOfMonth(s.year,s.month)) for(let t=1020;t<1320;t+=30) {
  if(!staffAt(shifts.filter(shift=>shift.date===date),employees,t).some(e=>e.station==="DRIVER")) missing+=30;
 }
 console.log("driver evening uncovered hours",missing/60,"hours",s.employees.map(e=>[e.id,shifts.filter(t=>t.employeeId===e.id).reduce((n,t)=>n+t.paidMinutes,0)/60]));
 expect(missing).toBe(0);
 for(const e of s.employees) expect(shifts.filter(t=>t.employeeId===e.id).reduce((n,t)=>n+t.paidMinutes,0)).toBe(e.targetMinutes);
 expect([...checkShifts({...s,shifts}).values()].flat().filter(i=>i.hard)).toEqual([]);
},120000);
