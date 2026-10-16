const STORAGE_KEY = "houseBillsData";

export function saveData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid application data.");
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


export function getData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData === null) {
    return null;
  }

  try {
    return JSON.parse(savedData);
  } catch {
    throw new Error(
      "Saved data is invalid JSON. Reset the application data before continuing."
    );
  }
}


export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
