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

    type AuthData{
      userId: ID!
      token: String!
    }

    type PostData{
      posts: [Post!]!
      totalPosts: Int!
    }

    type Query{
        getStatus: String!
        post(id: ID!): Post
        posts(page: Int!): PostData
        login(email: String!, password: String!): AuthData!
    }

    input userInfo{
        email: String!
        password: String!
        name: String!
    }

    input postInfo{
        title: String!
        imgUrl: String!
        content: String! 
    }

    type Mutation{
        createPost(input: postInfo): Post!
        updatePost(input: postInfo, id: ID!): Post!
        deletePost(id: ID!): String
        createUser(input: userInfo): User!
        updateStatus(status: String!): String
    }
`)
