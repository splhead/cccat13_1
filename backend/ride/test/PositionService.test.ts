import { AccountService } from '../src/AccountService'
import { PgDatabase } from '../src/PgDatabase'
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
        lat: -55.496887588317275,
        long: -84.522234807851476
      }
    }
    positionService = new PositionService()
  })

  afterAll(() => PgDatabase.disconnect())
  test('não deve atualizar a posição da corrida que não estiver com status "in progress"', async () => {
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
    await expect(
      positionService.updatePosition(inputUpdatePosition)
    ).rejects.toThrowError('The ride is not in progress')
  })

  test('deve atualizar a posição da corrida e buscá-la', async () => {
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
      ...coord.from
    }
    await rideService.startRide(outputRequestRide.rideId)
    const positon1 = await positionService.updatePosition(inputUpdatePosition)
    expect(positon1.position_id).toBeDefined()
    const positionGot = await positionService.getPosition(positon1.position_id)
    expect(positionGot.ride_id).toBe(outputRequestRide.rideId)
    expect(parseFloat(positionGot.lat)).toBe(inputUpdatePosition.lat)
    expect(parseFloat(positionGot.long)).toBe(inputUpdatePosition.long)
    expect(positionGot.date).toBeDefined()
  })

  test('deve lançar um erro ao tentar finalizar corrida que não esteja com status "in progress"', async () => {
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
    expect(
      positionService.finishRide(outputRequestRide.rideId)
    ).rejects.toThrowError('The ride is not in progress')
  })

  test('deve finalizar a corrida', async () => {
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
    await rideService.startRide(outputRequestRide.rideId)
    const inputUpdatePosition1 = {
      rideId: outputRequestRide.rideId,
      ...coord.from
    }
    await positionService.updatePosition(inputUpdatePosition1)
    const inputUpdatePosition2 = {
      rideId: outputRequestRide.rideId,
      lat: -33.97823475,
      long: -22.347882345
    }
    await positionService.updatePosition(inputUpdatePosition2)
    const inputUpdatePosition3 = {
      rideId: outputRequestRide.rideId,
      ...coord.to
    }
    await positionService.updatePosition(inputUpdatePosition3)
    await positionService.finishRide(outputRequestRide.rideId)
    const finishedRide = await rideService.getRide(outputRequestRide.rideId)
    expect(finishedRide.getStatus()).toBe('completed')
    expect(finishedRide.distance).toBeDefined()
    expect(finishedRide.fare).toBeDefined()
  })
})
