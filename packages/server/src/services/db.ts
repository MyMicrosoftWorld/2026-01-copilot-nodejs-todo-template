import { CosmosClient, Database, Container } from '@azure/cosmos';
import { Task } from '../models/task';

/**
 *   Service class for interacting with the Cosmos DB database.
 * @class DbService - Provides methods for interacting with the Cosmos DB database.
 * @constructor - Initializes the CosmosClient, Database, and Container objects.    
 * @method init - Creates the 'todos' database and 'tasks' container if they do not already exist.
 * @method getTasks - Retrieves all tasks from the 'tasks' container.
 * @method get - Retrieves a specific task by ID from the 'tasks' container.
 * @method create - Creates a new task in the 'tasks' container.
 * @method update - Updates an existing task in the 'tasks' container.
 * @method delete - Deletes a task by ID from the 'tasks' container.
 *  
 */

    
// Create a singleton instance of the DbService class and get that instance from the application code

let dbServiceInstance: DbService;

export function getDbService(): DbService {
  if (!dbServiceInstance) {
    dbServiceInstance = new DbService();
  }
  return dbServiceInstance;
}

export class DbService {
  private client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor() {
    // Check that the environment variables are set for Cosmos DB
    if (!process.env.COSMOS_DB_URI || !process.env.COSMOS_DB_KEY) {
      throw new Error('Missing Cosmos DB environment variables');
    }
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

  async getTasks() {    // Retrieve all tasks from the 'tasks' container
    const { resources } = await this.container.items.readAll().fetchAll();
    return resources;
  }

  async get(id: string): Promise<Task | null> { // Retrieve a specific task by ID from the 'tasks' container
    const { resource } = await this.container.item(id).read<Task>();
    return (resource ?? null) as Task | null;
  }

  async create(task: Task): Promise<Task> { // Create a new task in the 'tasks' container
    const { resource } = await this.container.items.create<Task>(task);
    return resource as Task;
  }

  async update(task: Task): Promise<Task> { // Update an existing task in the 'tasks' container
    const { resource } = await this.container.item(task.id).replace<Task>(task);
    return resource as Task;
  }

  async delete(id: string): Promise<void> { // Delete a task by ID from the 'tasks' container
    await this.container.item(id).delete();
  }
}
