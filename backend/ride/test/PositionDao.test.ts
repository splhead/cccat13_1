import crypto from 'crypto'
import { PositionDao } from '../src/PositionDao'
import { PositionDaoDatabase } from '../src/PositionDaoDatabase'
import { PgDatabase } from '../src/PgDatabase'

describe('PositionDao', () => {
  let positionDao: PositionDao

  beforeEach(() => {
    positionDao = new PositionDaoDatabase(PgDatabase.getInstance())
  })

  afterAll(() => PgDatabase.disconnect())

  test('deve salvar e buscar uma posição', async () => {
    const position = {
      position_id: crypto.randomUUID(),
      ride_id: crypto.randomUUID(),
      lat: -27.584905257808835,
      long: -48.545022195325124,
      date: new Date()
    }
    await positionDao.save(position)
    const positionGet = await positionDao.getById(position.position_id)
    expect(positionGet.position_id).toBe(position.position_id)
    expect(positionGet.ride_id).toBe(position.ride_id)
    expect(parseFloat(positionGet.lat)).toBe(position.lat)
    expect(parseFloat(positionGet.long)).toBe(position.long)
    expect(positionGet.date).toEqual(position.date)
  })
})
