FROM node:8

ENV HOST localhost
ENV PORT 3000

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Install GYP dependencies globally, will be used to code build other dependencies
RUN npm install -g --production node-gyp && \
    npm cache clean --force

# Install Gekko dependencies
RUN npm install --production && \
    npm cache clean --force

# Install Gekko Broker dependencies
WORKDIR exchange
RUN npm install --production && \
    npm cache clean --force
WORKDIR ../

RUN mv node_modules/ ../node_modules
RUN mv exchange/node_modules ../node_modules_exchange

EXPOSE 3000
RUN chmod +x /usr/src/app/docker-entrypoint.sh
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]

CMD ["--config", "config.js", "--ui"]
