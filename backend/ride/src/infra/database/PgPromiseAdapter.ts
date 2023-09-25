import { Connection } from './Connection'
import { PgDatabase } from './PgDatabase'

export class PgPromiseAdapter implements Connection {
  connection: any

  constructor() {
    this.connection = PgDatabase.getInstance().getConnection()
  }

  async query(statement: string, data: any): Promise<any> {
    return this.connection.query(statement, data)
  }

  async close(): Promise<void> {
    PgDatabase.disconnect()
  }
}
