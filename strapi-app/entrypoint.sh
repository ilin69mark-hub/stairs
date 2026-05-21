#!/bin/bash
set -e

wait_for_db() {
    local host=$1
    local port=$2
    echo "Waiting for database at $host:$port..."
    for i in {1..60}; do
        if nc -z "$host" "$port" 2>/dev/null || timeout 1 bash -c "cat < /dev/null > /dev/tcp/$host/$port" 2>/dev/null; then
            sleep 3
            echo "Database is ready!"
            return 0
        fi
        sleep 2
    done
    echo "Database connection timeout"
    return 1
}

if [ ! -f "/srv/app/node_modules/@strapi/strapi/package.json" ] || [ ! -f "/srv/app/config/database.js" ]; then
    echo "Installing Strapi project..."

    mkdir -p /srv/app
    cd /srv/app

    DATABASE_CLIENT=${DATABASE_CLIENT:-postgres}
    DATABASE_HOST=${DATABASE_HOST:-postgres-strapi}
    DATABASE_PORT=${DATABASE_PORT:-5432}
    DATABASE_NAME=${DATABASE_NAME:-strapi}
    DATABASE_USERNAME=${DATABASE_USERNAME:-stairs}
    DATABASE_PASSWORD=${DATABASE_PASSWORD:-secret}

    wait_for_db "$DATABASE_HOST" "$DATABASE_PORT"

    cat > package.json << 'EOF'
{
  "name": "strapi-app",
  "private": true,
  "version": "0.1.0",
  "description": "Strapi application",
  "scripts": {
    "develop": "strapi develop",
    "start": "strapi start",
    "build": "strapi build",
    "strapi": "strapi"
  },
  "dependencies": {
    "@strapi/strapi": "5.0.0-beta.5",
    "@strapi/plugin-users-permissions": "5.0.0-beta.5",
    "@strapi/plugin-i18n": "5.0.0-beta.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "6.28.0",
    "styled-components": "6.1.13",
    "pg": "8.11.3"
  },
  "devDependencies": {},
  "engines": {
    "node": ">=18.0.0 <=22.x.x",
    "npm": ">=6.0.0"
  }
}
EOF

    cat > .env << EOF
DATABASE_CLIENT=postgres
DATABASE_HOST=$DATABASE_HOST
DATABASE_PORT=$DATABASE_PORT
DATABASE_NAME=$DATABASE_NAME
DATABASE_USERNAME=$DATABASE_USERNAME
DATABASE_PASSWORD=$DATABASE_PASSWORD
JWT_SECRET=strapi-jwt-secret-key-change-in-production
ADMIN_JWT_SECRET=strapi-admin-jwt-secret-key-change-in-production
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=toBeModified
TRANSFER_TOKEN_SALT=toBeModified
EOF

    mkdir -p config public/uploads src

    cat > config/database.js << 'EOF'
module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: parseInt(env('DATABASE_PORT', '5432')),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: false,
    },
    useNullAsDefault: true,
  },
});
EOF

    cat > config/server.js << 'EOF'
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: parseInt(env.int('PORT', 1337)),
  app: {
    keys: env('APP_KEYS', 'key1,key2').split(','),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
EOF

    cat > config/admin.js << 'EOF'
module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin-jwt-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfer-token-salt'),
    },
  },
});
EOF

    cat > config/middlewares.js << 'EOF'
module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
EOF

    cat > config/plugins.js << 'EOF'
module.exports = {};
EOF

    echo "Installing dependencies..."
    yarn install

    echo "Strapi project setup complete"
fi

mkdir -p /srv/app/public/uploads
exec node /srv/app/node_modules/@strapi/strapi/bin/strapi.js develop --watch-admin