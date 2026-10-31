import {it,expect} from "vitest";
import {kyoEmployees} from "../restaurantData";
import {applyMigrations} from "../migrations";
import {initialScheduleFor,STORES} from "../stores";
it("matches names and rates to employee numbers without changing station order",()=>{
 const employees=kyoEmployees();
 expect(employees.map(e=>e.id)).toEqual([1,2,3,4,5,16,19,18,6,10,14,15,17,8,9,11,13].map(n=>`kyo-${n}`));
 expect(employees[0]).toMatchObject({name:"Van Lam, Hoang",hourlyRate:16.8,station:"KITCHEN",targetMinutes:9600});
 expect(employees[5]).toMatchObject({name:"Thi My Hanh Quach",hourlyRate:17.5,station:"SERVICE"});
 expect(employees[13]).toMatchObject({name:"Scelsi Fabio Noel",hourlyRate:13.9,station:"DRIVER"});
});
it("updates saved placeholder roster once, applying approved hours, preserving shifts and later edits",()=>{
 const base=initialScheduleFor(STORES[0]);
 const legacy={...base,employees:base.employees.map(e=>({...e,name:`Nhân viên ${e.id.slice(4)}`,hourlyRate:undefined,targetMinutes:777}))};
 const migrated=applyMigrations("kyo-sushi",legacy);
 expect(migrated.employees[0]).toMatchObject({name:"Van Lam, Hoang",hourlyRate:16.8,targetMinutes:9600});
 expect(migrated.shifts).toBe(legacy.shifts);
 const edited={...migrated,employees:[{...migrated.employees[0],name:"Custom",hourlyRate:20}]};
 expect(applyMigrations("kyo-sushi",edited)).toBe(edited);
 expect(applyMigrations("other",legacy)).toBe(legacy);
});

it("migrates hours even when the earlier name update was already applied",()=>{
 const base=initialScheduleFor(STORES[0]);
 const legacy={...base,migrations:["kyo-employee-names-rates-2026-10"],employees:base.employees.map(e=>({...e,targetMinutes:9600}))};
 const migrated=applyMigrations("kyo-sushi",legacy);
 expect(migrated.employees.find(e=>e.id==="kyo-8")?.targetMinutes).toBe(28*60);
 expect(migrated.employees.find(e=>e.id==="kyo-6")?.targetMinutes).toBe(5*60);
 expect(migrated.employees.reduce((sum,e)=>sum+e.targetMinutes,0)).toBe(1228*60);
 expect(applyMigrations("kyo-sushi",migrated)).toBe(migrated);
});
