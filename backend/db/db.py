import psycopg2
from psycopg2 import pool

class PostgresClient:
    def __init__(self, dbname, user, password, host='localhost', port=5432, minconn=1, maxconn=5):
        self.connection_pool = pool.SimpleConnectionPool(
            minconn,
            maxconn,
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )

    def get_conn(self):
        return self.connection_pool.getconn()

    def put_conn(self, conn):
        self.connection_pool.putconn(conn)

    def close_all(self):
        self.connection_pool.closeall()

# Example usage:
# client = PostgresClient(
#     dbname='your_db',
#     user='your_user',
#     password='your_password',
#     host='localhost',
#     port=5432
# )
# conn = client.get_conn()
# # Use conn as a regular psycopg2 connection
# client.put_conn(conn)
# client.close_all()