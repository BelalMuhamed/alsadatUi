export interface CategoryDto {
  id:number|null;
  name: string|null;
  createBy: string | null;
  createAt: string | null;
  updateBy: string | null;
  updateAt: string | null;
  isDeleted: boolean|null;
  deleteBy: string | null;
  deleteAt: string | null;
}
export interface CategoryFilteration {
  categoryName: string | null;
  isDeleted: boolean | null;
  pageSize: number|null;
  page: number|null;
}
