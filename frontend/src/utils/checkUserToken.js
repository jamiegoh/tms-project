import axios from "axios";


const checkUserToken = async () => {
    try {
        const response = await axios.get("auth/check");
        return response.data.isAuthenticated;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false; 
    }
};
export default checkUserToken;