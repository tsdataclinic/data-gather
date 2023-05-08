from server import env

AWS_ACCESS_KEY_ID = env.get_env('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env.get_env('AWS_SECRET_ACCESS_KEY')
AWS_REGION = env.get_env('AWS_REGION')
SERVER_URI = env.get_env('REACT_APP_SERVER_URI')
