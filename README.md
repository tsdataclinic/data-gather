# Interview App

An app to create interactive question-and-answer data collection experiences.

## Developing

<<<<<<< HEAD
=======
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

>>>>>>> d08b05f1e8b32a61bcaf6caa2eb09eb4a6ac48f5
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

### Setting up Backend

1. Initialize your venv

```
 python3 -m venv ./.venv
 source ./.venv/bin/activate
```

2. Install all requirements

```
pip install -r requirements.txt
```

3. Create development database

```
python3 ./db_setup.py /some/file/path
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
