# Interview App

An app to create interactive question-and-answer data collection experiences.

## Developing

### Setting up Backend

1. Initialize your venv

```
 python3 -m venv venv
 source venv/bin/activate
```

2. Install all requirements

```
pip install -r requirements.txt
```

3. Create development database

```
./setupDatabase.sh
```

If at any point you update the backend SQLAlchemy types or the routes in the `server/api/` directory, remember to run `yarn sync-types` to sync the frontend and backend services.

### Starting the API server

1. Activate your Python venv

```
source venv/bin/activate
```

2. Start the API server

```
yarn api
```

This starts the API server in http://localhost:8000

To view the API docs, open http://localhost:8000/docs

### Starting Front-End

This is a basic create-react-app (CRA) application.

1. Install all requirements

```
yarn install
```

2. Run the app

```
yarn start
```

This runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits.

## Other Scripts

### `yarn test`

Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

**TODO**: we need to implement tests. Currently this is a useless command.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
