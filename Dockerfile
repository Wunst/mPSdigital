FROM node:20-bookworm
WORKDIR /app

COPY . /app

RUN cd /app \
# Build backend
&& npm install \
&& npm run build \
# Build frontend
&& npm install --no-save yarn \
&& cd /app/frontend \
&& yarn \
&& yarn build

CMD [ "npm", "start" ]
