# IoT



import base64
import pymysql
from pymysql.err import OperationalError
from os import getenv

# TODO(developer): specify SQL connection details by replacing
# root_password, database_name and connection_name with your values
mysql_config = {
  'user': 'root',
  'password': 'Password123',
  'db': 'sensorDatabase',
  'charset': 'utf8mb4',
  'cursorclass': pymysql.cursors.DictCursor,
  'autocommit': True
}
CONNECTION_NAME = 'iot-project-330114:us-central1:myinstance'

# Create SQL connection globally to enable reuse
# PyMySQL does not include support for connection pooling
mysql_conn = None


def __get_cursor():
    """
    Helper function to get a cursor
      PyMySQL does NOT automatically reconnect,
      so we must reconnect explicitly using ping()
    """
    try:
        return mysql_conn.cursor()
    except OperationalError:
        mysql_conn.ping(reconnect=True)
        return mysql_conn.cursor()

def getData(data):
    split_data = data.split(";")
    if split_data[0] == "":
        temperature = 0
    else:
        temperature = split_data[0]
    if split_data[1] == "":
        latitude = 0
    else:
        latitude = split_data[1]
    if split_data[2] == "":
        NS = "N"
    else:
        NS = split_data[2]
    if split_data[3] == "":
        longitude = 0
    else:
        longitude = split_data[3]
    if split_data[4] == "":
        EW = "E"
    else:
        EW = split_data[4]
        
    return temperature, latitude, NS, longitude, EW

def save_data(event, context):

    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    datestring = event['attributes']['published_at']
    temperature, latitude, NS, longitude, EW = getData(pubsub_message)

    query = "INSERT INTO data VALUES ("
    query += f"'{context.event_id}', "
    query += f"'{event['attributes']['device_id']}', "
    query += f"'{event['attributes']['event']}', "
    query += f"'{pubsub_message}', "
    query += f"STR_TO_DATE('{datestring[0:len(datestring)-1]}000', '%Y-%m-%dT%H:%i:%s.%f'),"
    query += f"{str(temperature)},"
    query += f"{str(latitude)},"
    query += f"'{NS}',"
    query += f"{str(longitude)},"
    query += f"'{EW}');"
    print(query)


    global mysql_conn

    if not mysql_conn:
        try:
            mysql_conn = pymysql.connect(**mysql_config)
        except OperationalError:
            # If production settings fail, use local development ones
            mysql_config['unix_socket'] = f'/cloudsql/{CONNECTION_NAME}'
            mysql_conn = pymysql.connect(**mysql_config)

    # Remember to close SQL resources declared while running this function.
    # Keep any declared in global scope (e.g. mysql_conn) for later reuse.
    with __get_cursor() as cursor:
        cursor.execute(query)