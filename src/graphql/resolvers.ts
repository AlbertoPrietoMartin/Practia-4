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
        myProjects: async(_, __, {user})=>{
            if (!user) throw new Error("Autenticacion requerida");

            const db = getDB();
            return db.collection(PROJECT_COLLECTION).find().toArray();
        },

        projectDetails: async(_, __, {user})=>{
            if (!user) throw new Error("Autenticacion requerida");

            const db = getDB();
            return db.collection(PROJECT_COLLECTION).find().toArray();
        },

        me: async(_, __, {user})=>{
            if (!user) throw new Error("Autenticación requerida");

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

        login: async(_, {email, password, username}: {email:string, password: string, username: string})=>{
            const user = await validateUser(email, password);
            if(!user)
            {
                throw new Error("Esos credenciales te lo has inventao Paqui");
            }

            return signToken(user._id.toString());

        },

        createProject: async (_, { input }, { user }) => {
            if (!user) throw new Error("Autenticación requerida");

            const { name, description, startDate, endDate } = input;

            const db = getDB();

            const result = await db.collection(PROJECT_COLLECTION).insertOne({
                name,
                description,
                startDate,
                endDate,
                owner: new ObjectId(user._id),
                members: []
            });

            return {
                _id: result.insertedId,
                name,
                description,
                startDate,
                endDate,
                owner: user,
                members: []
            };
        },
        
        updateProject: async (_, { id, input }: { id: string, input: any }, { user }) => {
            if (!user) throw new Error("Autenticación requerida");

            const db = getDB();
            const project = await db.collection(PROJECT_COLLECTION).findOne({ _id: new ObjectId(id) });

            if (!project) throw new Error("Proyecto no encontrado");

            if (project.owner.toString() !== user._id) throw new Error("Solo el owner puede editar el proyecto");

            await db.collection(PROJECT_COLLECTION).updateOne(
                { _id: new ObjectId(id) },
                { $set: input }
            );

            return db.collection(PROJECT_COLLECTION).findOne({ _id: new ObjectId(id) });
        },
   
        addMember: async (_, { projectId, userId }, { user }) => {
            if (!user) throw new Error("Autenticación requerida");

            const db = getDB();

        const project = await db.collection(PROJECT_COLLECTION)
                .findOne({ _id: new ObjectId(projectId) });

            if (!project) throw new Error("Proyecto no encontrado");

            if (project.owner.toString() !== user._id)
                throw new Error("Solo el owner puede agregar miembros");

            await db.collection(PROJECT_COLLECTION).updateOne(
                { _id: new ObjectId(projectId) },
                { $addToSet: { members: new ObjectId(userId) } }
            );

            return db.collection(PROJECT_COLLECTION)
                .findOne({ _id: new ObjectId(projectId) });
        },

        createTask: async (_, { projectId, input }: { projectId: string, input: any }, { user }) => {
            if (!user) throw new Error("Autenticación requerida");

            const db = getDB();
            const project = await db.collection(PROJECT_COLLECTION).findOne({ _id: new ObjectId(projectId) });
            
            if (!project) throw new Error("Proyecto no encontrado");

            const isMember = project.owner.toString() === user._id || (project.members || []).map((m: any) => m.toString()).includes(user._id);

            if (!isMember) throw new Error("No perteneces al proyecto");

            const taskDoc: any = {
                title: input.title,
                projectId: new ObjectId(projectId),
                assignedTo: input.assignedTo ? new ObjectId(input.assignedTo) : null,
                status: input.status || "PENDING",
                priority: input.priority || "MEDIUM",
                dueDate: input.dueDate ? new Date(input.dueDate) : null
            };

            const result = await db.collection(TASK_COLLECTION).insertOne(taskDoc);

            const task = await db.collection(TASK_COLLECTION).findOne({ _id: result.insertedId });
            return task;

        },
        
        updateTaskStatus: async (_, { taskId, status }: { taskId: string, status: string }, { user }) => {
            if (!user) throw new Error("Autenticación requerida");

            const db = getDB();
            const task = await db.collection(TASK_COLLECTION).findOne({ _id: new ObjectId(taskId) });
            
            if (!task) throw new Error("Tarea no encontrada");

            const project = await db.collection(PROJECT_COLLECTION).findOne({ _id: new ObjectId(task.projectId) });
            if (!project) throw new Error("Proyecto no encontrado");

            await db.collection(TASK_COLLECTION).updateOne(
                { _id: new ObjectId(taskId) },
                { $set: { status } }
            );

            return db.collection(TASK_COLLECTION).findOne({ _id: new ObjectId(taskId) });
        },

        deleteProject: async (_, { id }: { id: string }, { user }) => {
            if (!user) throw new Error("Autenticación requerida");

            const db = getDB();
            const project = await db.collection(PROJECT_COLLECTION).findOne({ _id: new ObjectId(id) });
            
            if (!project) throw new Error("Proyecto no encontrado");

            if (project.owner.toString() !== user._id) throw new Error("Solo el owner puede eliminar el proyecto");

            await db.collection(TASK_COLLECTION).deleteMany({ projectId: new ObjectId(id) });

            await db.collection(PROJECT_COLLECTION).deleteOne({ _id: new ObjectId(id) });

            return true;
        },
    },

    User:{
        
    }
}