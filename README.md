# Matrix Generator

## Description
The [Matrix Generator](https://matrixgen.web.app) is a full stack web app that allows you to quickly enter matrices and transform them with actions, or use them for math. Results can be exported to various plaintext formats. You can also save your data to your browser's local storage, or create an account to save to the cloud. 

![Matrix Generator](demo.png)

## Technologies
- [Docker](https://www.docker.com/products/docker-desktop)
- [PostgreSQL](https://www.postgresql.org/download/)
- [FastAPI](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [TypeScript](https://www.typescriptlang.org/download)
- [React](https://reactjs.org/docs/getting-started.html)
- [React Redux](https://react-redux.js.org/introduction/getting-started)
- [Next.js](https://nextjs.org/docs/getting-started)
- [Bootstrap](https://getbootstrap.com/)
 

## Installation
Clone this repository, and update the environmental variables in `backend/.env.template` (rename this to `.env`) and in `frontend/.env.local.template` (rename this to `.env.local`).

```
git clone https://github.com/tamandrew/matrix-gen.git
```
## Run with Docker
In the root directory,
```
docker compose up
```

## Run without Docker

To start the frontend local server, in `/frontend`:
```
npm run dev
```

To start the backend local server, in `/backend`:
```
python3 -m uvicorn app.main:app --reload --port 8080 --host 0.0.0.0
``` 
