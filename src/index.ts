import { ApolloServer } from "apollo-server";
import { connectToMongo } from "./db/mongo";
import { typeDefs } from "./graphql/schemas";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./auth";

//se crea el server de apollo con schemas y resolvers
const server = new ApolloServer ({typeDefs, resolvers});

//funcion que inicia el servidor primero conectandose a mongo
const start = async() =>{
    await connectToMongo();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({req}) => {
            //obtiene el header authorization de la peticion
            const authHeader = req.headers.authorization;
            //si hay token, intenta obtener el usuario asociado
            const user = authHeader ? await getUserFromToken(authHeader!): null;
            //devuelve el user para q los resolvers tengan acceso al usuario
            return {user};
        }
    });

    await server.listen({port: 4000});
    console.log("Graphql, funcionando y sirviendo maní!");

}

//control de errores de al concectarse a mongo o al inciar el servidor
start().catch((err)=>{
    console.log("Apollo server error: ", err);
})
