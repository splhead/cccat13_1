import crypto from 'crypto'

export class Ride {
  driverId?: string
  distance?: number
  fare?: number

  private constructor(
    readonly rideId: string,
    readonly passengerId: string,
    private status: string,
    readonly fromLat: number,
    readonly fromLong: number,
    readonly toLat: number,
    readonly toLong: number,
    readonly date: Date
  ) {}

  static create(
    passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number
  ) {
    const rideId = crypto.randomUUID()
    const status = 'requested'
    const date = new Date()
    return new Ride(
      rideId,
      passengerId,
      status,
      fromLat,
      fromLong,
      toLat,
      toLong,
      date
    )
  }

  static restore(
    rideId: string,
    passengerId: string,
    driverId: string,
    distance: number,
    fare: number,
    status: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    date: Date
  ) {
    const ride = new Ride(
      rideId,
      passengerId,
      status,
      fromLat,
      fromLong,
      toLat,
      toLong,
      date
    )
    ride.driverId = driverId
    ride.distance = distance
    ride.fare = fare
    return ride
  }

  getStatus() {
    return this.status
  }

  accept(driverId: string) {
    if (this.status !== 'requested')
      throw new Error('The ride is not requested')
    this.driverId = driverId
    this.status = 'accepted'
  }

  start() {
    if (this.status !== 'accepted') throw new Error('The ride is not accepted')
    this.status = 'in_progress'
  }

  finish(distance: number, fare: number) {
    this.distance = distance
    this.fare = fare
    this.status = 'completed'
  }
}
