import type { Employee, Schedule } from "../types";
import type { WeekdayKey } from "./demand";
import { type DemandBand, type StaffingRule, clip } from "./staffing";
import { DEFAULT_WORK_HOURS, type WorkHoursConfig } from "./workHours";
import { kyoEmployees } from "./restaurantData";
export type StoreConfig = { id:string; name:string; shortName:string; address:string; sampleEmployees:()=>Employee[]; workHours?:WorkHoursConfig; notes?:string; demandProfile?:readonly DemandBand[]; dayWeights:Record<WeekdayKey,number>; staffingRules:readonly StaffingRule[] };
const day = () => [{startMinutes:600,endMinutes:840},{startMinutes:990,endMinutes:1320}];
export const KYO_HOURS: WorkHoursConfig = {
 perWeekday:{monday:day(),tuesday:day(),wednesday:day(),thursday:day(),friday:day(),saturday:day(),sunday:day()},
 holiday:day(), closedWeekdays:{monday:false,tuesday:false,wednesday:false,thursday:false,friday:false,saturday:false,sunday:false}
};
const rules: readonly StaffingRule[] = [
 {priority:"required",label:"Bồi cao điểm",when:"18–21h: 2 bồi, thứ 6–7: 3 bồi",minStaff:2,maxStaff:Infinity,scaled:true,who:e=>e.station==="SERVICE",windows:clip(1080,1260)},
 {priority:"required",label:"Bếp suốt giờ mở cửa",when:"10–14h, 16:30–22h",minStaff:1,maxStaff:Infinity,scaled:false,who:e=>e.station==="KITCHEN",windows:blocks=>blocks},
 {priority:"required",label:"Bồi suốt giờ mở cửa",when:"10–14h, 16:30–22h",minStaff:1,maxStaff:Infinity,scaled:false,who:e=>e.station==="SERVICE",windows:blocks=>blocks},
];
export const STORES: StoreConfig[] = [{id:"kyo-sushi",name:"Kyo sushi & grill",shortName:"Kyo",address:"Ledergasse 22, 73525 Schwäbisch Gmünd",sampleEmployees:kyoEmployees,workHours:KYO_HOURS,staffingRules:rules,
 demandProfile:[{startMinutes:600,endMinutes:840,level:0.5,label:"Trưa"},{startMinutes:990,endMinutes:1080,level:1,label:"Đầu tối"},{startMinutes:1080,endMinutes:1260,level:1.5,label:"Cao điểm"},{startMinutes:1260,endMinutes:1320,level:0.8,label:"Cuối tối"}],
 dayWeights:{monday:1,tuesday:1,wednesday:1,thursday:1,friday:1.5,saturday:1.5,sunday:1},
 notes:"Định mức giờ/tháng theo bảng nhân viên tháng 10; tổng 1.228h, tài xế 88h. Tài xế Minijob ưu tiên 17–22h, có thể làm ban ngày. Mỗi ngày 10–14h, 16:30–22h; lễ như bình thường. Cao điểm 18–21h; thứ 6–7 hệ số 1,5. Mức tối thiểu tạm: 1 bếp + 1 bồi trong giờ mở; bồi 18–21h tối thiểu 2, thứ 6–7 tối thiểu 3 (lễ theo hệ số Chủ nhật); tài xế phân bổ theo định mức, ưu tiên 17–22h."}];
export const DEFAULT_STORE_ID = STORES[0].id;

/** Merkt sich die zuletzt gewählte Filiale auf diesem Gerät. */
const STORE_KEY = "kyo-sushi-app:store";

export function loadStoreId(): string {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && STORES.some((s) => s.id === saved)) return saved;
  } catch {
    /* ignorieren */
  }
  return DEFAULT_STORE_ID;
}

export function saveStoreId(id: string): void {
  try {
    localStorage.setItem(STORE_KEY, id);
  } catch {
    /* ignorieren */
  }
}

export function storeById(id: string): StoreConfig {
  return STORES.find((s) => s.id === id) ?? STORES[0];
}

/**
 * Ältere Stände (gespeichert, bevor Nieu 37 dazukam) kennen noch keinen
 * personKey. Dann erkennt „Tạo lịch làm việc" nicht, dass Bá Việt Nguyen im
 * Shin und im Nieu derselbe Mensch ist, und plant ihn am selben Tag in beiden
 * Läden. Fehlt der personKey, übernimmt ein Mitarbeiter mit derselben id und
 * demselben Namen wie in der Startbelegschaft personKey und – nur in diesem
 * einen Schritt – auch maxDaysPerWeek. Danach steht der personKey im Stand, und
 * ein später geleertes „tối đa … ngày/tuần" bleibt leer. Löst man die
 * Verbindung im Tab Nhân viên, steht dort "" statt nichts.
 */
export function withSharedPersonDefaults(employees: Employee[], store: StoreConfig): Employee[] {
  const starters = new Map(store.sampleEmployees().map((e) => [e.id, e]));
  return employees.map((employee) => {
    const starter = starters.get(employee.id);
    // "" = im Tab Nhân viên bewusst gelöst – dann nicht wieder verbinden.
    if (employee.personKey !== undefined || !starter?.personKey || starter.name !== employee.name) return employee;
    return {
      ...employee,
      personKey: starter.personKey,
      maxDaysPerWeek: employee.maxDaysPerWeek ?? starter.maxDaysPerWeek,
    };
  });
}

/** Startstand einer Filiale: September 2026 mit der Belegschaft aus der Angabe. */
export function initialScheduleFor(store: StoreConfig): Schedule {
  return {
    companyName: store.name,
    address: store.address,
    year: 2026,
    month: 10,
    workHours: structuredClone(store.workHours ?? DEFAULT_WORK_HOURS),
    dateOverrides: [],
    employees: store.sampleEmployees(),
    shifts: [],
  };
}
