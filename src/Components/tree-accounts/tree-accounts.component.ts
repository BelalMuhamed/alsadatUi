import { Component } from '@angular/core';
import { TreeAccountDto } from '../../app/models/TreeAccountDto';
import { TreeAccountsService } from '../../app/Services/tree-accounts.service';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tree-accounts',
  standalone: true,
  imports: [MatIcon,CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './tree-accounts.component.html',
  styleUrl: './tree-accounts.component.css'
})
export class TreeAccountsComponent {
 accounts: TreeAccountDto[] = []
  flatAccounts: TreeAccountDto[] = []
  loading = false

  constructor(private treeAccountsService: TreeAccountsService) {}

  ngOnInit(): void {
    this.loadAccounts()
  }
abs(value: number): number {
  return Math.abs(value);
}

  loadAccounts(): void {
    this.loading = true
    this.treeAccountsService.getTreeAccounts().subscribe({
      next: (data) => {
        this.accounts = data

        this.flatAccounts = this.flattenTree(data)
        this.loading = false
      },
      error: (error) => {
        // error handled silently
        this.loading = false
      },
    })
  }

  flattenTree(nodes: TreeAccountDto[] | null | undefined, level = 0): TreeAccountDto[] {
  if (!nodes || nodes.length === 0) return []

  let result: TreeAccountDto[] = []

  for (const node of nodes) {
    const flatNode = {
      ...node,
      level,
      expanded: false,
    }
    result.push(flatNode)

    if (node.children && node.children.length > 0) {
      result.push(...this.flattenTree(node.children, level + 1))
    }
  }

  return result
}


  toggleExpand(account: TreeAccountDto): void {
    account.expanded = !account.expanded
  }

  isVisible(account: TreeAccountDto): boolean |undefined{
    if (account.level === 0) return true

    const parent = this.findParent(account)
    if (!parent) return true

    return parent.expanded && this.isVisible(parent)
  }

  findParent(account: TreeAccountDto): TreeAccountDto | null {
    const index = this.flatAccounts.indexOf(account)
    if (index <= 0) return null

    for (let i = index - 1; i >= 0; i--) {
      if (this.flatAccounts[i].level === (account.level || 0) - 1) {
        return this.flatAccounts[i]
      }
    }

    return null
  }

  hasChildren(account: TreeAccountDto): boolean {
    return account.children && account.children.length > 0
  }

  onAdd(account?: TreeAccountDto): void {
    // add account invoked
    // Implement add logic or open dialog
  }

  onEdit(account: TreeAccountDto): void {
    // edit account invoked
    // Implement edit logic or open dialog
  }

  onDelete(account: TreeAccountDto): void {
    // delete account invoked
    // Implement delete logic with confirmation
  }

  onView(account: TreeAccountDto): void {
    // view account details invoked
    // Implement view details
  }

  formatNumber(value?: number): string {
    if (value === null || value === undefined) return "0.00"
    return value.toFixed(2)
  }

  getBalance(account: TreeAccountDto): number {
    const debit = account.debit || 0
    const credit = account.credit || 0
    return debit - credit
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return "balance-debit"
    if (balance < 0) return "balance-credit"
    return "balance-zero"
  }
}
