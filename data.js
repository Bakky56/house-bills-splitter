
import { getData, saveData } from "./js/storage.js";

export async function initializeData() {

  const existingData = getData();

  if (existingData !== null) {
    return existingData;
  }

 
  const response = await fetch("./data.json");

  if (!response.ok) {
    throw new Error("Could not load the initial demo data.");
  }

  const initialData = await response.json();


  const requiredCollections = [
    "houses",
    "members",
    "expenses",
    "settlements",
    "activities"
  ];

  for (const collection of requiredCollections) {
    if (!Array.isArray(initialData[collection])) {
      throw new Error(`Invalid demo data: ${collection} must be an array.`);
    }
  }

  saveData(initialData);

  return initialData;
}
