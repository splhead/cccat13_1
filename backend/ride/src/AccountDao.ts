export interface AccountDao {
  save(data: any): Promise<void>
  getByEmail(email: string): Promise<any>
  getById(accountId: string): Promise<any>
}
