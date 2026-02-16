import { createConnection, Connection, getConnectionManager } from 'typeorm';
import connectionOptions from '../ormconfig';

let connection: Connection;

export const getConnection = async (): Promise<Connection> => {
    if (!connection) {
        try {
            const connectionManager = getConnectionManager();
            
            // If connection already exists in the manager, reuse it
            if (connectionManager.has('default')) {
                connection = connectionManager.get('default');
                
                // If connection is not active, reconnect
                if (!connection.isConnected) {
                    connection = await connection.connect();
                }
            } else {
                // Create a new connection
                connection = await createConnection(connectionOptions);
            }
            
            console.log('Database connection established successfully');
        } catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
    
    return connection;
};
