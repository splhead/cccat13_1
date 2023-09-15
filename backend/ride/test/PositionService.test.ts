import { AccountService } from '../src/AccountService'
import { PositionService } from '../src/PositionService'
import { RideService } from '../src/RideService'

describe('Position Service', () => {
  let coord: {
    from: { lat: number; long: number }
    to: { lat: number; long: number }
  }
  let positionService: PositionService

  beforeEach(() => {
    coord = {
      from: {
        lat: -27.584905257808835,
        long: -48.545022195325124
      },
      to: {
        lat: -27.496887588317275,
        long: -48.522234807851476
      }
    }
    positionService = new PositionService()
  })
  test('deve atualizar a posição da corrida', async () => {
    const inputSignupPassenger: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      isPassenger: true
    }
    const accountService = new AccountService()
    const outputSignupPassenger = await accountService.signup(
      inputSignupPassenger
    )
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const rideService = new RideService()
    const outputRequestRide = await rideService.requestRide(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await accountService.signup(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await rideService.acceptRide(inputAcceptRide)
    const inputUpdatePosition = {
      rideId: outputRequestRide.rideId,
      lat: 1,
      long: 2
    }
    await positionService.updatePosition(inputUpdatePosition)
  })
})
