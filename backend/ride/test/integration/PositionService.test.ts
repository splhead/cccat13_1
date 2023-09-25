import { AccountDao } from '../../src/application/repository/AccountDao'
import { RideDao } from '../../src/application/repository/RideDao'
import { AcceptRide } from '../../src/application/usecase/AcceptRide'
import { GetRide } from '../../src/application/usecase/GetRide'
import { RequestRide } from '../../src/application/usecase/RequestRide'
import { Signup } from '../../src/application/usecase/Signup'
import { StartRide } from '../../src/application/usecase/StartRide'
import { PgDatabase } from '../../src/infra/database/PgDatabase'
import { AccountDaoDatabase } from '../../src/infra/repository/AccountDaoDatabase'
import { RideDaoDatabase } from '../../src/infra/repository/RideDaoDatabase'
import { PositionService } from '../../src/PositionService'

describe('Position Service', () => {
  let accountDao: AccountDao
  let rideDao: RideDao
  let signup: Signup
  let requestRide: RequestRide
  let acceptRide: AcceptRide
  let startRide: StartRide
  let getRide: GetRide
  let coord: {
    from: { lat: number; long: number }
    to: { lat: number; long: number }
  }
  let positionService: PositionService

  beforeEach(() => {
    accountDao = new AccountDaoDatabase(
      PgDatabase.getInstance().getConnection()
    )
    rideDao = new RideDaoDatabase(PgDatabase.getInstance().getConnection())
    signup = new Signup(accountDao)
    requestRide = new RequestRide(accountDao, rideDao)
    acceptRide = new AcceptRide(accountDao, rideDao)
    startRide = new StartRide(rideDao)
    getRide = new GetRide(rideDao)
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
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
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
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
    const inputUpdatePosition = {
      rideId: outputRequestRide.rideId,
      ...coord.from
    }
    await startRide.execute(outputRequestRide.rideId)
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
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
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
    const outputSignupPassenger = await signup.execute(inputSignupPassenger)
    const inputRequestRide = {
      passengerId: outputSignupPassenger.accountId,
      ...coord
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide)
    const inputSignupDriver: any = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '95818705552',
      carPlate: 'AAA9999',
      isDriver: true
    }
    const outputSignupDriver = await signup.execute(inputSignupDriver)
    const inputAcceptRide = {
      rideId: outputRequestRide.rideId,
      driverId: outputSignupDriver.accountId
    }
    await acceptRide.execute(inputAcceptRide)
    await startRide.execute(outputRequestRide.rideId)
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
    const finishedRide = await getRide.execute(outputRequestRide.rideId)
    expect(finishedRide.getStatus()).toBe('completed')
    expect(finishedRide.distance).toBeDefined()
    expect(finishedRide.fare).toBeDefined()
  })
})
