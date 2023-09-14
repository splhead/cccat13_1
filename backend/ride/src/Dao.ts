export interface Dao {
  create(data: any): Promise<void>
  get(id: any): Promise<any>
  update(data: any): Promise<void>
  delete(id: any): Promise<void>
}
