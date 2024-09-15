import { In, IsNull, Repository } from "typeorm";
import { AppDataSource } from "../database/dataSource";
import { Table } from "../database/entity/Table.entity";
import { Restaurant } from "../database/entity/Restaurant.entity";
import { ErrorCode } from "../error_handler/error-code";
import { ErrorException } from "../error_handler/error-exception";

export class TableService {
  tableRepository: Repository<Table>;
  constructor() {
    this.tableRepository = AppDataSource.getRepository(Table);
  }

  public createTable(table: Table): Table {
    const newTable = this.tableRepository.create(table);

    return newTable;
  }

  public async getTableById(id: number): Promise<Table | null> {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ["occupiedByOrder"],
    });

    return table;
  }

  public async getTableByName(tableName: string): Promise<Table | null> {
    const table = await this.tableRepository.findOne({
      where: { tableName },
      relations: ["occupiedByOrder"],
    });

    return table;
  }

  public async getTableByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Table[]> {
    const categories = await this.tableRepository.find({
      where: { id: In(ids), restaurant },
    });

    return categories;
  }

  public async getEnabledTables(restaurant: Restaurant): Promise<Table[]> {
    const tables = await this.tableRepository.find({
      where: { restaurant, isEnabled: true },
      relations: ["occupiedByOrder"],
      order: { tableOrder: "ASC" },
    });
    return tables;
  }

  public async getAvailableTables(restaurant: Restaurant): Promise<Table[]> {
    const tables = await this.tableRepository
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.occupiedByOrder", "order")
      .where("t.restaurantId = :restaurantId", {
        restaurantId: restaurant.id,
      })
      .andWhere('t."isEnabled" = :isEnabled', { isEnabled: true })
      .andWhere("order.id IS NULL")
      .orderBy('t."tableOrder"', "ASC")
      .getMany();

    return tables;
  }

  public async saveTables(tables: Table[]) {
    if (tables[0]?.restaurant) {
      const enabledTables = await this.getEnabledTables(tables[0].restaurant);
      const hasIntersection = enabledTables.some((enabledTable) =>
        tables.some(
          (givenTable) => enabledTable.tableName === givenTable.tableName
        )
      );

      if (hasIntersection) {
        throw new ErrorException(ErrorCode.SQLDuplicate);
      }
    }

    return await this.tableRepository.save(tables);
  }

  public async countTableByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Number> {
    const count = await this.tableRepository.count({
      where: { id: In(ids), restaurant },
    });

    return count;
  }

  async clearTable(table: Table) {
    table.occupiedByOrder = null;
    return await this.tableRepository.save(table);
  }
}
