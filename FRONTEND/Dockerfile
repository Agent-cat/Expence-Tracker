# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app


COPY package.json ./

RUN npm install


COPY . .


RUN npm run build

# Stage 2: Serve the application with serve
FROM node:22-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=build /app/dist .

EXPOSE 3000

CMD ["serve", "-s", ".", "-l", "3000"]
