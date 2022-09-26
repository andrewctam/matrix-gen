# Matrix Generator

## Description
The [Matrix Generator](https://matrixgen.web.app) is a full stack web app that allows you to quickly enter matrices, then export them to text. There are additional features such as matrix math and quick actions. You can save your data to your browser's local storage, or create an account to save to the cloud.

![Owner View](demo.png)

## Technologies
- [Docker](https://www.docker.com/products/docker-desktop)
- [PostgreSQL](https://www.postgresql.org/download/)
- [FastAPI](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [Node.js](https://nodejs.org/en/download/)
- [React](https://reactjs.org/docs/getting-started.html)
- [Next.js](https://nextjs.org/docs/getting-started)
- [Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs)

## Installation
Clone this repository, and update the environmental variables in backend/.env.template (rename this to .env) and in frontend/.env.local.template (rename this to .env.local). This app is built using docker, so run ```docker compose up``` at the root of the project.

```
git clone https://github.com/tamandrew/matrix-gen.git
docker compose up
```

If you want to run the servers separately, you can start the local servers using ```npm run dev``` in the frontend and ```python3 -m uvicorn app.main:app --reload --port 8080 --host 0.0.0.0``` in the backend.
