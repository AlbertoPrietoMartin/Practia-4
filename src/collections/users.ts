import { get } from "axios";
import { getDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const COLLECTION = "usersVideoGames";

//obtiene la contraseña, la encripta, guarda al usuario en la coleccion
//y te devuelve el id del nuevo usuario (NUNCA guardas la contraseña sin cifrar)
export const  createUser = async (email: string, password: string, username: string, createdAt: Date)=>{
    const db= getDB();
    const laPasswordEncripta = await bcrypt.hash(password, 10);

    const result = await db.collection(COLLECTION).insertOne({
        email,
        password: laPasswordEncripta,
        username,
        createdAt
    });

    //toString pa poder usarlo sin JWT
    return result.insertedId.toString();
};

//busca un usuario por su email, compara la contraseña q mandó con la encriptada
//si coincide devuelve usuario y si no null
export const validateUser = async (email:string, password: string)=>{
    const db = getDB();
    const user = await db.collection(COLLECTION).findOne({email});
    if(!user){
        return null;
    };

    const deLasDosVenusCualEsMasYCualEsMenos = await bcrypt.compare(password, user.password);
    if(!deLasDosVenusCualEsMasYCualEsMenos){
        return null;
    };

    return user;
};

//recibe un Id, lo convierte en ObjectId, busca al usuario en la coleccion
//devuelve el doc del usuario o null
export const findUSerById = async(id:string)=>{
    const Db = getDB();
    return await Db.collection(COLLECTION).findOne({_id: new ObjectId(id)});
}