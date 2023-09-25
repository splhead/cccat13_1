import { PgDatabase } from '../database/PgDatabase'
import { PositionDao } from '../../application/repository/PositionDao'
import { Connection } from '../database/Connection'

export class PositionDaoDatabase implements PositionDao {
  constructor(readonly connection: Connection) {}

  async save(position: any): Promise<void> {
    await this.connection.query(
      'insert into cccat13.position (position_id, ride_id, lat, long, date) values ($1,$2,$3,$4,$5)',
      [
        position.position_id,
        position.ride_id,
        position.lat,
        position.long,
        position.date
      ]
    )
  }

  async getById(positionId: string): Promise<any> {
    const [position] = await this.connection.query(
      'select * from cccat13.position where position_id = $1',
      [positionId]
    )
    return position
  }

  async getByRideId(rideId: string): Promise<any> {
    const positions = await this.connection.query(
      'select * from cccat13.position where ride_id = $1',
      [rideId]
    )
    return positions
  }
}
