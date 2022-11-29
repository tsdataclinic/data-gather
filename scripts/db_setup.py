import argparse
import logging

from server.init_db import initialize_dev_db

logging.basicConfig(level=logging.INFO)

parser = argparse.ArgumentParser(description="Set up dev database")
parser.add_argument(
    dest="file_path",
    type=str,
    help="The file path to set up the database",
)
args = parser.parse_args()
initialize_dev_db(args.file_path)
