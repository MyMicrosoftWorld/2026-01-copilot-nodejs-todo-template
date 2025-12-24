import { CosmosClient, Database, Container } from '@azure/cosmos';
import { Task } from '../models/task';

// DbService wraps the Cosmos SDK for simple CRUD on the 'tasks' container
export class DbService {
  private client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor() {
    const endpoint = process.env.COSMOS_DB_URI!;
    const key = process.env.COSMOS_DB_KEY!;
    this.client = new CosmosClient({ endpoint, key });
    this.database = this.client.database('todos');
    this.container = this.database.container('tasks');
  }

  async init() {
    const { database } = await this.client.databases.createIfNotExists({
      id: 'todos',  // Create the 'todos' database if it doesn't exist already
    }); // Ensure the 'todos' database is created
    const { container } = await this.database.containers.createIfNotExists({
      id: 'tasks',  // Create the 'tasks' container if it doesn't exist already
    }); // Ensure the 'tasks' container is created
  } // Initialize the database and container    

  async getTasks() {
    const { resources } = await this.container.items.readAll().fetchAll();
    return resources;
  }

  async get(id: string): Promise<Task | null> {
    const { resource } = await this.container.item(id).read<Task>();
    return (resource ?? null) as Task | null;
  }

  async create(task: Task): Promise<Task> {
    const { resource } = await this.container.items.create<Task>(task);
    return resource as Task;
  }

  async update(task: Task): Promise<Task> {
    const { resource } = await this.container.item(task.id).replace<Task>(task);
    return resource as Task;
  }

  async delete(id: string): Promise<void> {
    await this.container.item(id).delete();
  }
}
