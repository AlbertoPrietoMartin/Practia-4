import { gql } from "apollo-server";

export const typeDefs = gql`

    type User {
        id: ID!
        username: String!
        email: String!
        password: String!
        createdAt: Date!
    }

    type Projects {
        _id: ID!
        name: String!
        description: String!
        startDate: Date!
        endDate: String!
        owner: String!
        members:  [ID!]!
        tasks: [Tasks!]!
    }

    type Tasks {
        _id: ID!,
        title: String!
        projectId: ID!
        assignedTo: ID!
        status: String!
    }
    
    type AuthPayload{
        token: String!
        user: User!
    }

    input reigsterInput{
        username: String!
        email: String!
        password: String!
    }

    input loginInput{
        email: String!
        password: String!
    }

    input createProjectInput{
        name: String!
        description: String!
        createDate: String!
        endDate: String!
    }

    input updateProjectInput{
        name: String!
        description: String!
        startDate: String!
        endDate!
    }

    input TaskInput{
        title: String!
        assignedTo: ID!
        priority: priority!
        dueDate: String!
    }

    input updateTaskInput{
        title: String!
        assignedTo: ID!
        status: taskStatus!
        priority: priority!
        dueDate: String!
    }

    type Query {
        myProjects: [Project!]!
        projectDetails(projectId: ID): Project!
        users: [User!]!
    }


    #add devuelve el objeto creado y login y register el token jwt
    type Mutation {
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!

        createProject(input: CreateProjectInput!): Project!
        updateProject(id: ID!, input: UpdateProjectInput!): Project!
        addMember(projectId: ID!, userId: ID!): Project!
        createTask(projectId: ID!, input: TaskInput!): Task!

        #en teoria esto no entra en el examen
        updateTaskStatus(taskId: ID!, status: TaskStatus!): Task!
        deleteProject(id: ID!): Project!    
    }

`;