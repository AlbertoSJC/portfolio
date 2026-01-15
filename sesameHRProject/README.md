Sesame Candidatures

In Order to run it we need to have:

node 23.8.0

npm 10.9.2

command to start the application:

npm i

npm start

launch tests with

npm run test

We can also start it in Docker, in order to do that, we need to have docker installed

Docker 28.0.1

command necessary to start it:

docker build -t sesame-app .

docker run -p 4321:4321 sesame-app

(clarify that the name sesame-app can be changed to whatever in both commands)
