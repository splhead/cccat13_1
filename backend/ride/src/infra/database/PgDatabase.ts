import pgp from 'pg-promise'

export class PgDatabase {
  private static instance: PgDatabase
  private static connection: any

  private constructor() {
    PgDatabase.connection = pgp()(
      'postgres://postgres:123456@localhost:5432/app'
    )
  }

  static getInstance(): PgDatabase {
    if (!PgDatabase.instance) PgDatabase.instance = new PgDatabase()
    return PgDatabase.instance
  }

  getConnection() {
    return PgDatabase.connection
  }

  static async disconnect() {
    if (PgDatabase.connection) {
      await PgDatabase.connection.$pool.end()
    }
  }
}
