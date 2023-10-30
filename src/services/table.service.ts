import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Table } from '../database/entity/Table.entity';

export class TableService {
  tableRepository: Repository<Table>;
  constructor() {
    this.tableRepository = AppDataSource.getRepository(Table);
  }

  public async getTableById(id: number): Promise<Table> {
    const user = await this.tableRepository.findOneBy({
      id
    });

    return user;
  }

  public async saveTable(Table: Table) {
    return await this.tableRepository.save(Table);
  }
}
