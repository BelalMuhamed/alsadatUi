// Payroll DTOs - تطابق الـ Backend DTOs

export interface GeneratePayrollRequestDto {
  employeeCode: string;
  month: number;
  year: number;
}

export interface GenerateBulkPayrollRequestDto {
  month: number;
  year: number;
  employeeCodes?: string[] | null; // null = كل الموظفين
  includeActiveOnly?: boolean;
  autoPostToAccounting?: boolean;
  paymentMethod?: string;
}

export interface PayrollGenerationDetailDto {
  employeeCode: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  overtimePay: number;
  deductions: number;
  netSalary: number;
  status: string; // Success, Failed
  message?: string;
  payrollId?: number;
}

export interface BulkPayrollResultDto {
  totalEmployees: number;
  processedSuccessfully: number;
  failed: number;
  totalNetSalary: number;
  totalDeductions: number;
  totalOvertime: number;
  accountingEntryNumber?: string;
  details: PayrollGenerationDetailDto[];
  generatedAt: Date;
  generatedBy: string;
}

export interface PayrollFilterDto {
  month?: number;
  year?: number;
  departments?: string[];
  status?: string; // Generated, Posted, Paid
  fromDate?: Date;
  toDate?: Date;
  minNetSalary?: number;
  maxNetSalary?: number;
}

export interface PayrollResponseDto {
  id: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  payPeriod: Date;
  basicSalary: number;
  overtimePay: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentMethod?: string;
  accountingEntryNumber?: string;
  postedToAccountingDate?: Date;
  paidDate?: Date;
  paidBy?: string;
  createdAt: Date;
}

export interface PayrollExportDto {
  fileContent: Uint8Array;
  fileName: string;
  contentType: string;
}

export interface PayrollSummaryDto {
  month: number;
  year: number;
  totalEmployees: number;
  totalBasicSalary: number;
  totalOvertime: number;
  totalDeductions: number;
  totalNetSalary: number;
  generatedCount: number;
  postedCount: number;
  paidCount: number;
}

export interface MarkPayrollPaidDto {
  payrollIds: number[];
  paymentMethod: string;
  paymentReference?: string;
}

export interface PayrollFilterRequest {
  month?: number;
  year?: number;
  departments?: string[];
  status?: string;
  fromDate?: string;
  toDate?: string;
  minNetSalary?: number;
  maxNetSalary?: number;
}
