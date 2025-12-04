import { format } from "path";
import { IResolvers } from "@graphql-tools/utils";
import { title } from "process";
import { getDB } from "../db/mongo";
import { Collection, ObjectId } from "mongodb";
import { createUser, validateUser } from "../collections/users";
import { signToken } from "../auth";
import { validate } from "graphql";

const TASK_COLLECTION = "taskCollection";
const USERS_COLLECTION = "usersCollection";
const PROJECT_COLLECTION = "projectCollection";

export const resolvers: IResolvers = {
    Query : {
        myProject: async()=>{
            const db = getDB();
            return db.collection(PROJECT_COLLECTION).find().toArray;
        },

        projectDetails: async()=>{
            const db = getDB();
            return db.collection(PROJECT_COLLECTION).find().toArray();
        },

        me: async(_, __, {user})=>{
            if(!user){
                return null;
            };

            return {
                id: user._id.toString(),
                email: user.email
            }
        },
    },

    Mutation: {
        register: async(_, {email, password}: {email:string, password: string})=>{
            const userId = await createUser(email,password);
            return signToken(userId);
        },

        login: async(_, {email, password}: {email:string, password: string})=>{
            const user = await validateUser(email, password);
            if(!user)
            {
                throw new Error("Esos credenciales te lo has inventao Paqui");
            }

            return signToken(user._id.toString());

        },
        
    },

    User:{
        listOfMyGames: async (parent) =>{
            const db = getDB();
            const listOfMyProjects= parent.listOfMyProjects as  Array<string> || [];

            const projectListOfObjects = await db.collection(PROJECT_COLLECTION).find({
                _id: {$in: listOfMyProjects.map(id=> new ObjectId(id))}
            }).toArray();

            return projectListOfObjects;
    },

        listOfMyTasks: async (parent) =>{
            const db = getDB();
            const listOfMyTasks= parent.listOfMyProjects as  Array<string> || [];

            const TasksListOfObjects = await db.collection(PROJECT_COLLECTION).find({
                _id: {$in: listOfMyTasks.map(id=> new ObjectId(id))}
            }).toArray();

            return TasksListOfObjects;
        }
    }
}