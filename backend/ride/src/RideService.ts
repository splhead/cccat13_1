import crypto from 'crypto'
import { AccountDao } from './AccountDao'
import { PgDatabase } from './PgDatabase'
import { RideDao } from './RideDao'

export type Coord = {
  lat: number
  long: number
}

export class RideService {
  accountDao: AccountDao
  rideDao: RideDao

  constructor(pgDatabase: PgDatabase) {
    this.accountDao = new AccountDao(pgDatabase)
    this.rideDao = new RideDao(pgDatabase)
  }

  async requestRide(accountId: string, from: Coord, to: Coord) {
    const account = await this.accountDao.get(accountId)
    if (!account) throw new Error('Passageiro não encontrado!')
    if (!account.is_passenger) throw new Error('Não é passageiro!')
    const ridesNotCompleted =
      await this.rideDao.getRidesNotCompletedByPassengerId(accountId)
    if (ridesNotCompleted?.length > 0)
      throw new Error('Já existe uma corrida em andamento!')
    const rideId = crypto.randomUUID()
    const ride = {
      rideId,
      passengerId: accountId,
      status: 'requested',
      fromLat: from.lat,
      fromLong: from.long,
      toLat: to.lat,
      toLong: to.long,
      date: new Date()
    }
    await this.rideDao.create(ride)
    return { ride_id: rideId }
  }

  async acceptRide(accountId: string) {
    const account = await this.accountDao.get(accountId)
    if (!account) throw new Error('Motorista não encontrado!')
    if (!account.is_driver) throw new Error('Não é motorista!')
    const ridesAcceptedOrInProgress =
      await this.rideDao.getRidesNotCompletedByDriverId(accountId)
    if (ridesAcceptedOrInProgress)
      throw new Error('Motorista com outra corrida em andamento!')
  }
}
