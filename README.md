# Valyent AI

> Generate full-stack web applications with AI.

## Approach

Valyent AI leverages fully-featured frameworks like AdonisJS, Laravel, ... to generate full-stack web applications with AI.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/valyentdev/valyent.ai
```

2. Install dependencies:

```bash
cd valyent.ai
npm install
```

3. Set up environment variables.

```bash
cp .env.example .env
```

4. Start the Docker Compose services:

```bash
docker compose up -d
```

5. Run the migrations:

```bash
node ace migration:run
```

6. Start the development server:

```bash
npm run dev
```

Or, start generating from the command-line:

```bash
node ace generate
```

## License

This project is licensed under AGPL 3.0.
