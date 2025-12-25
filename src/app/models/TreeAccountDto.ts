export interface TreeAccountDto {
  id?: number
  accountName: string
  debit?: number
  credit?: number
  children: TreeAccountDto[]
  expanded?: boolean
  level?: number
}
