# Express-Mongodb-Ts-Starter

A project based on Express(nodejs), Mongodb, Typescript, which is enable user's regiser and login.
At the same time, the main functions is allowing registered user<document user> to create a file<document file> and share with others.
The creator of file take full control over this file, like update all fileds and delete.
But user who is shared just only update the limited<document fileAccess> fileds

# Setup
before start this project, you need to check you dev env, something follow is required.
however these versions are irrelevant, latast is best.
- Nodejs
- TypeScript
- MongoDB (MongoDB Compass is recommended, which is a UI tool make it easy to interact MongoDB server without complex shell)

# Structure
~~~
starter             Project root dir
├─── constant       Constant for global project
├─── controllers    Routing URL
├─── ├─── index.ts  An output of all of controllers
├─── exception      Customized Exception
├─── middleware     Express middleware, including auth and error handlers
├─── models         Javascript object mapping to MongoDB schema
├─── public         static folder
├─── utils          common js utils
├─── validate       validate user input data
├─── vo             A standard http reponse data format
├─── index.ts       App entry
~~~

# Quick start
Follow these steps, you can easy boot the project
start MongoDb, open CMD
```
cd D:\MongoDB\Server\6.0\bin #(path your MongoDB installed)
./mongod --dbpath D:\MongoDB\Server\6.0\data\test
```
Install nodejs dependencies and start, change to project root dir
```
npm install
npm run dev
```
then the application is running  on port ```http://localhost:8001```

# MongoDB schema
user -> record user data
```
{
    uuid: string,
    username: string;
    password: string;
    avatar: string;
    email: string;
}
```
file -> where user work together
```
{
    creatorUserUUID: string, // who create it
    uuid: string,
    title: string, // owner could update
    description: string, // owner could update
    content: object // owener and user who has permission could update
}
```
fileAccess -> a file's user permission records
```
{
    fileUUID: string,
    userUUID: string,
    type: string,
    path: string, // When type equals `UPDATE`, path's value `a.a-1` means `userUUID` what key it could update or remove
    status: string 
}
```

# Examples
We will give several examples that will make you good understand how this project work.
Before start, you need a API debug tool like postman, but you can feel free to use others.
And the project requset base configure like below.
Request Header
```
Content-Type: application/json
jwt-token: xxx (URL /user/register, /user/login is not required)
... others default ...
```
## Register two users to test
```
URL:
http://127.0.0.1:8001/user/add

body:
{
"username": "16607574271",
"password": "123456"
}

--- repeat ---
URL:
http://127.0.0.1:8001/user/add

body:
{
"username": "16607574272",
"password": "123456"
}
```

## Login to get JwtToken

```
URL:
http://127.0.0.1:8001/user/login

body:
{
"username": "16607574271",
"password": "123456"
}
response:
{
    "success": true,
    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYmVjNTRlZGMtMzJlNi00MGM4LTg3NjUtOGRkYWY1MDBkODY0IiwiaWF0IjoxNjY5MzU0NDE1LCJleHAiOjE2Njk2MTM2MTV9.SGYMQUHN4wIgrQlyqI780Mc6y2GePLUHEKkeiwerEEU",
    "msg": "opetation is ok"
}
```

## Create a new file
To create a new file by jwtToken(16607574271)
```
URL:
http://127.0.0.1:8001/file/add
body: 
{
    "success": true,
    "data": {
        "creatorUserUUID": "bec54edc-32e6-40c8-8765-8ddaf500d864",
        "title": "test",
        "description": "123456",
        "content": {
            "a": {
                "a-1": "test"
            }
        },
        "uuid": "6348da13-d983-4999-9b8d-5d78f2ca9586",
        "id": "638058812a6dba549978668b"
    },
    "msg": "opetation is ok"
}
response:
{
    "success": true,
    "data": {
        "creatorUserUUID": "bec54edc-32e6-40c8-8765-8ddaf500d864",
        "title": "test",
        "description": "123456",
        "content": {
            "a": {
                "a-1": "test"
            }
        },
        "uuid": "6348da13-d983-4999-9b8d-5d78f2ca9586", # file identifer
        "id": "638058812a6dba549978668b"
    },
    "msg": "opetation is ok"
}
```
## Get file data
In fact, the owner of file could get file data certainly by jwtToken(16607574271)

```
URL:
http://127.0.0.1:8001/file/info?uuid=348da13-d983-4999-9b8d-5d78f2ca9586
body:
{}
response:
{
    "success": true,
    "data": {
        "creatorUserUUID": "bec54edc-32e6-40c8-8765-8ddaf500d864",
        "title": "test",
        "description": "123456",
        "content": {
            "a": {
                "a-1": "test"
            }
        },
        "uuid": "6348da13-d983-4999-9b8d-5d78f2ca9586",
        "id": "638058812a6dba549978668b"
    },
    "msg": "opetation is ok"
}
```
however, when you change jwtToken(16607574272)

```
URL:
http://127.0.0.1:8001/file/info?uuid=348da13-d983-4999-9b8d-5d78f2ca9586
body:
{}
response:
{
    "success": false,
    "data": null,
    "msg": "access limited"
}
```

## To update file
the owner of file could update file.
Important tip: `key` means what field(title, description, content) you want to update.`value` is field's value, `contentPath` is required when the `key` equils `content` and it's value mean field `content`'s object key path like
```
a.a-1 => content:{
    a: {
        a-1: ''
    }
}
```
update title
```
URL:
http://127.0.0.1:8001/file/update?uuid=348da13-d983-4999-9b8d-5d78f2ca9586
body:
{
"key": "title",
"value": "test2",
}
```
update content, then the content.a.a-1's value is `test2`
```
URL:
http://127.0.0.1:8001/file/update?uuid=348da13-d983-4999-9b8d-5d78f2ca9586
body:
{
"key": "content",
"value": "test2",
"contentPath": "a.a-1"
}

```
User without permisson to call this api

```
URL:
http://127.0.0.1:8001/file/update?uuid=348da13-d983-4999-9b8d-5d78f2ca9586
body:
{
"key": "content",
"value": "test2",
"contentPath": "a.a-1"
}
response:
{
    "success": false,
    "data": null,
    "msg": "access limited"
}
```

## To allow user update file
In order to make user who does not own the file to update, we have to give the user permission by owner's jwtToken

```
URL:
http://127.0.0.1:8001/fileAccess/update
body: {
    "userUUID": "90b927e9-2f36-4e4a-a828-1a14061f6560", #user(16607574272) identifer
    "type":"UPDATE", // READ, UPDATE is alternative
    "path": "a.a-1", // `content`'s path allow user to update or delete
    "status": "OK" // OK, EXPIRED is alternative
}

```
After that, user(16607574272) could update ther file field(content=>a=>a-1) value


# License
[MIT](http://opensource.org/licenses/MIT)




