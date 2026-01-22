FROM node:18-alpine

WORKDIR /app

# Copy backend package files from backend folder
COPY backend/package*.json ./

RUN npm install

# Copy backend source code
COPY backend .

EXPOSE 5000

CMD ["npm", "start"]
