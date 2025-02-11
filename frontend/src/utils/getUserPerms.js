import axios from "axios";

const getUserPerms = async () => {
    try {
        const response = await axios.get(`/groups/getperms`);
        return response.data;
    } catch (err) {
        console.error("Error selecting data:", err);
        throw err;
    }
};

export default getUserPerms; 