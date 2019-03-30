const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Post{
        _id: ID!
        title: String!
        imgUrl: String!
        content: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User{
        _id: ID!
        email: String!
        password: String
        name: String!
        status: String!
        posts: [Post!]!
    }

    type Query{
        user(_id: ID!): User
        post(_id: ID!): Post
        posts: [Post]
    }

    input userInfo{
        email: String!
        password: String!
        name: String!
    }

    type Mutation{
      createUser(input: userInfo): User!
    }
`)
