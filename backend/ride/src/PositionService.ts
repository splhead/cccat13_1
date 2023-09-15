import crypto from 'crypto'
import { PgDatabase } from './PgDatabase'
import { PositionDao } from './PositionDao'
import { PositionDaoDatabase } from './PositionDaoDatabase'
import { RideDao } from './RideDao'
import { RideDaoDatabase } from './RideDaoDatabase'

export class PositionService {
  constructor(
    readonly rideDao: RideDao = new RideDaoDatabase(PgDatabase.getInstance()),
    readonly positionDao: PositionDao = new PositionDaoDatabase(
      PgDatabase.getInstance()
    )
  ) {}

  async updatePosition(input: any) {
    const ride = await this.rideDao.getById(input.rideId)
    if (ride.status !== 'in_progress')
      throw new Error('The ride is not in progress')
    const positionId = crypto.randomUUID()
    const position = {
      positionId,
      rideId: input.ride_id,
      lat: input.lat,
      long: input.long,
      date: new Date()
    }
    await this.positionDao.save(position)
  }
}
