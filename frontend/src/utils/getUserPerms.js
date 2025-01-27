import axios from "axios";

const getUserPerms = async () => {
    try {
        const groups = await axios.get(`/groups/getperms`);
        return groups.data;
    } catch (err) {
        console.error("Error selecting data:", err);
        throw err;
    }
};

export default getUserPerms; 