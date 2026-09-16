import {registerProvider} from "@tsed/di";
import {DataSource} from "typeorm";
import {Logger} from "@tsed/logger";

export const SQLITE_DATA_SOURCE = Symbol.for("SqliteDataSource");
export const SqliteDataSource = new DataSource({
  type: "sqlite",
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  database: "database.sqlite",
  synchronize: true,
});

registerProvider<DataSource>({
  provide: SQLITE_DATA_SOURCE,
  type: "typeorm:datasource",
  deps: [Logger],
  async useAsyncFactory(logger: Logger) {
    await SqliteDataSource.initialize();

    logger.info("Connected with typeorm to database: Sqlite");

    return SqliteDataSource;
  },
  hooks: {
    $onDestroy(dataSource) {
      return dataSource.isInitialized && dataSource.close();
    }
  }
});
