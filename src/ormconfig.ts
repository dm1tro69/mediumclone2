import {PostgresConnectionOptions} from 'typeorm/driver/postgres/PostgresConnectionOptions'

const config:PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mediumclone1',
  password: '123',
  database: 'mediumclone1',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true
}
export default config
