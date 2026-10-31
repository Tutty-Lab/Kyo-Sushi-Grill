import type { Schedule } from "../types";
import { KYO_EMPLOYEE_DETAILS } from "./restaurantData";
const HOURS_MIGRATION = "kyo-payroll-monthly-hours-2026-10";
const ROSTER_MIGRATION = "kyo-employee-names-rates-2026-10";
/** Apply the supplied roster once, retaining employee IDs, contracts and existing shifts. */
export function applyMigrations(storeId:string,schedule:Schedule):Schedule {
 if(storeId!=="kyo-sushi") return schedule;
 const migrateRoster=!schedule.migrations?.includes(ROSTER_MIGRATION);
 const migrateHours=!schedule.migrations?.includes(HOURS_MIGRATION);
 if(!migrateRoster&&!migrateHours) return schedule;
 return {...schedule, employees:schedule.employees.map(employee=>{
  const match=/^kyo-(\d+)$/.exec(employee.id);
  const details=match ? KYO_EMPLOYEE_DETAILS[Number(match[1])] : undefined;
  if(!details) return employee;
  return {...employee,
   ...(migrateRoster?{name:details.name,hourlyRate:details.hourlyRate}:{}),
   ...(migrateHours?{targetMinutes:details.hours*60,weeklyHours:undefined,quotaSource:"hours" as const}:{}),
  };
 }),migrations:[...(schedule.migrations??[]),...(migrateRoster?[ROSTER_MIGRATION]:[]),...(migrateHours?[HOURS_MIGRATION]:[])]};
}
