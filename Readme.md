# Live Chat
Live chat application built on Socket.io

### Prerequisites
You will need to have the following installed
* *docker-compose*
* *node.js*
* *npm*

### Installing

1. `git clone https://github.com/jaxin007/chat.git`

2. `cd chat`

3. `npm i`

4. `docker-compose up` - Will create docker image with mongoose instance inside on default port `27017`

5. `npm start` - Will begin the app on default port `3000`

6. Go to the `http://localhost:3000`

### Docker

You may use this app only via the Docker.

You can use this command for the first launch or on CI.

```npm
npm run docker:init
```

## Built With

* [Node.js](https://nodejs.org) - Run-time environment includes everything you need to execute a program written in JavaScript
* [Express.js](https://expressjs.com) - Web application framework used with Node.js. Provides server capabilities
* [Nodemon](https://www.npmjs.com/package/nodemon) - Utility that will monitor for any changes in your source and automatically restart your server.
* [Pug](https://www.npmjs.com/package/pug) - High performance template engine heavily influenced by Haml and implemented with JavaScript for Node.js and browsers.
* [Socket.io](https://socket.io) - Provides the library for instant messaging, Live Chat.
* [Bootstrap](https://getbootstrap.com) - Used for CSS and NavBar
* [Docker-compose](https://docs.docker.com/compose) - Tool for defining and running multi-container Docker applications.

## Author links
* *[github](https://github.com/jaxin007)*
* *[telegram](https://t.me/jaxin007)*
