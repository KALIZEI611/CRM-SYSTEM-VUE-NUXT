import { APP_WRITE_ID } from "@/constants/app.constants";
import { Account, Client, Databases, Storage, Query, ID } from "appwrite";

export const client = new Client();

client.setEndpoint("https://cloud.appwrite.io/v1").setProject(APP_WRITE_ID);

export const account = new Account(client);
export const DB = new Databases(client);
export const storage = new Storage(client);
export { ID, Query }; // Экспортируйте Query
