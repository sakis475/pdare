import { app } from './app';

// import { connect } from './model/postgres-connect';

// connect(process.env.POSTGRES!);

const PORT = process.env.SERVER_PORT || 3013;

const server = app.listen(PORT, () => {
  console.log(`Application started on port ${PORT}!`);
});
