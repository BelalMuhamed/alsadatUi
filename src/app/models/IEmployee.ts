export interface EmployeeDTo {
  userId?: string;
  email: string;
  password?: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  gender: number; // 0 = Male, 1 = Female
  createBy?: string;
  createAt?: Date;
  updateBy?: string;
  updateAt?: Date;
  isDeleted?: boolean;
  deleteBy?: string;
  deleteAt?: Date;
  cityID?: number;
  cityName?: string;
  employeeCode?: string;
  accountNumber?: number;
  accountName?: string;
  sno: string;
  overtimeRatePerHour: number;
  deductionRatePerHour: number;
  departmentID?: number;
  departmentName?: string;
  birthDate: Date;
  hireDate: Date;
  salary: number;
  timeIn: string; // TimeOnly format "HH:mm:ss"
  timeOut: string; // TimeOnly format "HH:mm:ss"
  weekHoliday1: number; // WeekDays enum
  weekHoliday2?: number; // WeekDays enum
  nameOfCreatedBy?: string;
  roleName?: string;
  roleId?: string;
  rolesName?: string[];
  rolesId?: string[];
}

export interface EmployeeHelper {
  empCode?: string | null;
  departmentName?: string | null;
  employeeName?: string | null;
  cityName?: string | null;
}

export interface EmployeeSalaryDTo {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  selectedMonth: number;
  selectedYear: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  basicSalary: number;
  overtimeHours: number;
  deductionHours: number;
  totalOvertimePay: number;
  totalDeduction: number;
  netSalary: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedList<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
