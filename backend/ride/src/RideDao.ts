import { Dao } from './Dao'
import { PgDatabase } from './PgDatabase'

export class RideDao implements Dao {
  private connection: any

  constructor(pgDatabase: PgDatabase) {
    this.connection = pgDatabase.getConnection()
  }

  async create(data: RideDto): Promise<void> {
    const {
      rideId,
      passengerId,
      driverId,
      status,
      fare,
      distance,
      fromLat,
      fromLong,
      toLat,
      toLong,
      date
    } = data
    await this.connection.query(
      'insert into cccat13.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [
        rideId,
        passengerId,
        driverId,
        status,
        fare,
        distance,
        fromLat,
        fromLong,
        toLat,
        toLong,
        date
      ]
    )
  }

  async getRidesNotCompletedByPassengerId(passengerId: string) {
    const [rides] = await this.connection.query(
      'select * from cccat13.ride where passenger_id = $1 and status != $2',
      [passengerId, 'completed']
    )
    if (!rides) return
    if (rides && !Array.isArray(rides)) return rides
    const mappedRides = rides.map((ride: any) => this.mapperToDto(ride))
    return mappedRides
  }

  async getRidesNotCompletedByDriverId(driverId: string) {
    const [rides] = await this.connection.query(
      "select * from cccat13.ride where passenger_id = $1 and status in ('accepted','in_progress')",
      [driverId]
    )
    if (!rides) return
    if (rides && !Array.isArray(rides)) return rides
    const mappedRides = rides.map((ride: any) => this.mapperToDto(ride))
    return mappedRides
  }

  async get(id: any): Promise<any> {
    const query = 'select * from cccat13.ride where ride_id = $1'
    const [ride] = await this.connection.query(query, [id])
    if (!ride) return
    return this.mapperToDto(ride)
  }

  async update(data: any): Promise<void> {}

  async delete(id: any): Promise<void> {
    await this.connection.query('delete from cccat13.ride where ride_id = $1', [
      id
    ])
  }

  private mapperToDto(ride: any): RideDto {
    return {
      rideId: ride.ride_id,
      passengerId: ride.passenger_id,
      driverId: ride?.driver_id,
      status: ride.status,
      fare: ride.fare & Number(ride.fare),
      distance: ride.distance & Number(ride.distance),
      fromLat: Number(ride.from_lat),
      fromLong: Number(ride.from_long),
      toLat: Number(ride.to_lat),
      toLong: Number(ride.to_long),
      date: new Date(ride.date)
    }
  }
}

export type RideDto = {
  rideId: string
  passengerId: string
  driverId?: string
  status: string
  fare?: number
  distance?: number
  fromLat: number
  fromLong: number
  toLat: number
  toLong: number
  date: Date
}
