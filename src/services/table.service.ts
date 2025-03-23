import { In, IsNull, Not, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Table } from '../database/entity/Table.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';

export class TableService {
  tableRepository: Repository<Table>;
  constructor() {
    this.tableRepository = AppDataSource.getRepository(Table);
  }

  public createTable(table: Table): Table {
    const newTable = this.tableRepository.create(table);

    return newTable;
  }

  public async getTableById(
    id: number,
    restaurant: Restaurant
  ): Promise<Table | null> {
    const table = await this.tableRepository.findOne({
      where: { id, restaurant: { id: restaurant.id } },
    });

    return table;
  }

  public async getTableByName(
    tableName: string,
    restaurant: Restaurant
  ): Promise<Table | null> {
    const table = await this.tableRepository.findOne({
      where: { tableName, restaurant: { id: restaurant.id } },
    });

    return table;
  }

  public async getTableByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Table[]> {
    const categories = await this.tableRepository.find({
      where: { id: In(ids), restaurant: { id: restaurant.id } },
    });

    return categories;
  }
  public async getEnabledTablesWithOrder(
    restaurant: Restaurant,
    onlyAvailableTables = false
  ): Promise<Table[]> {
    const query = this.tableRepository
      .createQueryBuilder('table')
      .leftJoinAndSelect('table.occupiedByOrder', 'order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.item', 'item')
      .leftJoinAndSelect('orderItems.itemPropertyOfItem', 'itemPropertyOfItem')
      .leftJoinAndSelect('itemPropertyOfItem.itemProperty', 'itemProperty')
      .leftJoinAndSelect('order.user', 'user')
      .where('table.restaurant = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .andWhere(
        '(table.isEnabled = true OR (table.isEnabled = false AND order.id IS NOT NULL))'
      )
      .andWhere('order.closedAt IS NULL')
      .orderBy('order.id', 'DESC')
      .addOrderBy('orderItems.id', 'ASC');

    // If onlyAvailableTables is true, filter tables that are not currently occupied by any orders
    if (onlyAvailableTables) {
      query.andWhere('order.id IS NULL');
    }

    // Execute the query
    const tables = await query.getMany();

    return tables;
  }

  public async getEnabledTables(restaurant: Restaurant): Promise<Table[]> {
    const tables = await this.tableRepository
      .createQueryBuilder('table')
      .where('table.restaurant = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .andWhere('table.isEnabled = true')
      .orderBy('table.tableOrder', 'ASC')
      .getMany();

    return tables;
  }

  public async saveTable(table: Table) {
    return await this.tableRepository.save(table);
  }

  public async saveTables(tables: Table[]) {
    // if (tables[0]?.restaurant) {
    //   const enabledTables = await this.getEnabledTablesWithOrder(
    //     tables[0].restaurant
    //   );
    //   const hasIntersection = enabledTables.some((enabledTable) =>
    //     tables.some(
    //       (givenTable) => enabledTable.tableName === givenTable.tableName
    //     )
    //   );

    //   if (hasIntersection) {
    //     throw new ErrorException(ErrorCode.SQLDuplicate);
    //   }
    // }

    return await this.tableRepository.save(tables);
  }

  public async countTableByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Number> {
    const count = await this.tableRepository.count({
      where: { id: In(ids), restaurant: { id: restaurant.id } },
    });

    return count;
  }

  async clearTable(table: Table) {
    table.occupiedByOrder = null;
    return await this.tableRepository.save(table);
  }
}
