import {Db, MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let miBaseDeDatosBonica: Db;
const dbName = "Mondongo";

export const connectToMongo = async () =>{
    try{
        const mongoUrl = process.env.MONGO_URL;

        client = new MongoClient(mongoUrl!);
        await client .connect();
        miBaseDeDatosBonica = client.db(dbName);
        console.log("Conectado al mondongo de forma chachipé");

    }catch(err){
        console.log("Error de mondongo majete: ", err);
    }
}

export const getDB = (): Db => miBaseDeDatosBonica;