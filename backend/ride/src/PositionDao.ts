export interface PositionDao {
  save(position: any): Promise<void>
  getById(positionId: string): Promise<any>
}
