const getBaseUrl = () => {
         const deployedUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
         const localUrl = process.env.NEXT_PUBLIC_LOCAL_API_URL;


         if (!deployedUrl && !localUrl) {
                  throw new Error("No API base URL is defined in the environment variables!");
         }
         return  deployedUrl ? deployedUrl : localUrl;
         
};

export const API_BASE_URL = getBaseUrl();



