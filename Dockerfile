# Use Node.js LTS (Alpine for smaller image)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment (Cloud Run auto sets PORT, so don't hardcode)
ENV NODE_ENV=production

# Expose the port your app listens to
# NOTE: Cloud Run sets $PORT automatically, you must use process.env.PORT in code
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]
