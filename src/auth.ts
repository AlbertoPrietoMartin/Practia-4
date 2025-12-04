import { userInfo } from "os";
import jwt from "jsonwebtoken";
import dotenv  from "dotenv";
import { Db, ObjectId } from "mongodb";
import { getDB } from "./db/mongo";

dotenv.config();

//info que se guarda dentro del jwt
export type TokenPayload = {
    userId: string;
}

//clave secreta
const SUPER_SECRET = process.env.SUPER_SECRET;

//crea un jwt q contiene el userId y devuelve un string que es el jwt listo para usar
export const signToken = (userId: string)=>{
    return jwt.sign({userId}, SUPER_SECRET!, {expiresIn: "1h"});
};

//recibe un token jwt y verifica que se valido, si lo es devuelve el payload(objeto q se puso al firmar)
export const verifyToken = (token: string): TokenPayload | null =>{
    try{
        return jwt.verify(token, SUPER_SECRET!) as TokenPayload
    }catch{
        return null; //si no, null
    }
};

//busca un usuario en la coleccion con un id igual al del payload y devuelve el usuario completo
export const getUserFromToken = async (token:string) =>{
    const payload = verifyToken(token);
    if(!payload) return null;

    const db = getDB();
    return await db.collection("usersVideoGames").findOne({
        _id: new ObjectId(payload.userId)
    })
}