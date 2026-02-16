// export const handleRequest = async <T>(
//     request: () => Promise<any>,
//   ): Promise<T> => {
//     try {
//       const response = await request();
//       return response.data as T;
//     } catch (error: any) {
//       if (error.response) {
  
//         // The request was made and the server responded with a status code outside the 2xx range
//         console.error('Request Error:', { data: error.response.data, });  // headers: error.response.headers,
  
//         throw new Error(`Error: ${error.response.status} - ${error.response.data.message || 'Unknown server error'}`,);
  
//       } else if (error.request) {
  
//         // The request was made, but no response was received
//         console.error('No Response', error.request);
  
//         throw new Error('No response from the server. Please check your network or server status.',);
  
//       } else {
  
//         // Something else happened while setting up the request
//         console.error('Error Message:', error.message);
  
//         throw new Error(`Unexpected error: ${error.message}`);
  
//       }
//     }
//   };