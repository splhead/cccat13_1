import crypto from 'crypto'
import { PgDatabase } from './PgDatabase'
import { PositionDao } from './PositionDao'
import { PositionDaoDatabase } from './PositionDaoDatabase'
import { RideDao } from './RideDao'
import { RideDaoDatabase } from './RideDaoDatabase'
import { Coord } from './Coord'
import { DistanceCalculator } from './DistancCalculator'

export class PositionService {
  constructor(
    readonly rideDao: RideDao = new RideDaoDatabase(PgDatabase.getInstance()),
    readonly positionDao: PositionDao = new PositionDaoDatabase(
      PgDatabase.getInstance()
    )
  ) {}

  async updatePosition(input: any) {
    await this.checkRideInProgress(input.rideId)
    const positionId = crypto.randomUUID()
    const position = {
      position_id: positionId,
      ride_id: input.rideId,
      lat: input.lat,
      long: input.long,
      date: new Date()
    }
    await this.positionDao.save(position)
    return {
      position_id: positionId
    }
  }

  async getPosition(positionId: string) {
    const position = await this.positionDao.getById(positionId)
    return position
  }

  async finishRide(rideId: string) {
    const ride = await this.checkRideInProgress(rideId)
    const positions = await this.positionDao.getByRideId(rideId)
    const coords = positions.map(position => {
      return new Coord(position.lat, position.long)
    })
    const pairOfCoords = []
    for (let index = 0; index < coords.length; index++) {
      pairOfCoords.push({ from: coords[index], to: coords[index + 1] })
    }
    const distance = pairOfCoords.reduce((result, currentPairOfCoords) => {
      if (currentPairOfCoords.to) {
        result += DistanceCalculator.calculate(
          currentPairOfCoords.from,
          currentPairOfCoords.to
        )
      }
      return result
    }, 0)
    const fare = distance * 2.1
    const finishedRide = {
      rideId: ride.ride_id,
      driverId: ride.driver_id,
      distance,
      fare,
      status: 'completed'
    }
    await this.rideDao.update(finishedRide)
  }

  private async checkRideInProgress(rideId: string) {
    const ride = await this.rideDao.getById(rideId)
    if (ride.status !== 'in_progress')
      throw new Error('The ride is not in progress')
    return ride
  }
}
