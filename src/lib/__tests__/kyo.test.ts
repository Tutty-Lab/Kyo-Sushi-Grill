import {it,expect} from "vitest";
import {STORES,initialScheduleFor} from "../stores";
import {publicHolidays} from "../holidays";
import {resolveDay, effectiveWeekdayKey} from "../workHours";
import {generateSchedule} from "../scheduler";
import {staffAt} from "../staffing";
import {datesOfMonth} from "../demand";
import {checkShifts} from "../shiftChecks";
it("Kyo roster, contracts and driver preferences",()=>{
 const s=initialScheduleFor(STORES[0]);
 expect(s.employees).toHaveLength(17);
 expect(STORES[0].staffingRules.some(r=>r.label==="Tài xế buổi tối")).toBe(false);
 expect(s.employees.filter(e=>e.station==="KITCHEN").map(e=>e.id)).toEqual([1,2,3,4,5].map(n=>`kyo-${n}`));
 expect(s.employees.filter(e=>e.station==="SERVICE")).toHaveLength(8);
 expect(s.employees.map(e=>e.targetMinutes/60)).toEqual([160,100,120,120,170,120,160,120,5,20,20,20,5,28,15,25,20]);
 expect(s.employees.filter(e=>e.station==="DRIVER").every(e=>e.employmentType==="MINIJOB"&&!e.shiftWindow&&e.preferredWindows?.[0].startMinutes===1020)).toBe(true);
 const h=publicHolidays(2026);expect(h.has("2026-11-01")).toBe(true);expect(h.has("2026-10-31")).toBe(false);
 for(const date of ["2026-10-26","2026-11-01"]) expect(resolveDay(s.workHours,date,h).blocks).toEqual([{startMinutes:600,endMinutes:840},{startMinutes:990,endMinutes:1320}]);
});
it("generated Kyo schedule respects legal limits and station coverage",()=>{
 const store=STORES[0],s=initialScheduleFor(store);
 const shifts=generateSchedule({...s,rules:store.staffingRules,weights:store.dayWeights,demandProfile:store.demandProfile,storeTag:store.id});
 expect(shifts.length).toBeGreaterThan(0);
 const drivers=s.employees.filter(e=>e.station==="DRIVER");
 const driverPaid=shifts.filter(t=>drivers.some(e=>e.id===t.employeeId)).reduce((sum,t)=>sum+t.paidMinutes,0);
 expect(driverPaid).toBe(88*60);
 const employees=new Map(s.employees.map(e=>[e.id,e]));
 for(const date of datesOfMonth(s.year,s.month)) {
  for(const block of resolveDay(s.workHours,date,publicHolidays(s.year)).blocks) {
   for(let t=block.startMinutes;t<block.endMinutes;t+=30) {
    const present=staffAt(shifts.filter(shift=>shift.date===date),employees,t);
    expect(present.some(e=>e.station==="KITCHEN"),`${date} ${t} kitchen`).toBe(true);
    expect(present.some(e=>e.station==="SERVICE"),`${date} ${t} service`).toBe(true);
    if(t>=1080 && t<1260) {
     const day=effectiveWeekdayKey(date,publicHolidays(s.year));
     expect(present.filter(e=>e.station==="SERVICE").length,`${date} ${t} peak service`).toBeGreaterThanOrEqual(day==="friday"||day==="saturday"?3:2);
    }

   }
  }
 }
 expect([...checkShifts({...s,shifts}).values()].flat().filter(i=>i.hard)).toEqual([]);
 for(const e of s.employees) expect(shifts.filter(t=>t.employeeId===e.id).reduce((n,t)=>n+t.paidMinutes,0)).toBe(e.targetMinutes);
},120000);
