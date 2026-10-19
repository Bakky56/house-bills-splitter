import { getData, saveData } from "./js/storage.js";

export async function initializeData() {
try {

const existingData = getData();

if (existingData !== null) {
  return existingData;
}


const initialData = {
  houses: [],
  members: [],
  expenses: [],
  settlements: [],
  activities: []
};


saveData(initialData);


return initialData;


} catch (error) {
console.error("Initialization failed:", error);
throw error;
}
}
