# Use the official Node 18 image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json first
# This leverages Docker's layer cache.
COPY package*.json ./

# Install dependencies inside the container
# This will be stored in the /app/node_modules volume
RUN npm install

# Copy the rest of your frontend code
COPY . .

# Expose the Vite port
EXPOSE 5173

# The command to run your development server
CMD ["npm", "run", "dev"]