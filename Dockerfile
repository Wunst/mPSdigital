FROM node:20-bookworm
WORKDIR /app

COPY . /app

RUN cd /app \
# Build backend
&& npm install \
&& npm run build \
# Build frontend
&& cd /app/frontend \
&& npm install \
&& npm run build

CMD [ "npm", "start" ]
