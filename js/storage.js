const myStorage = "houseBillsData";

export function saveData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid application data.");
  }

  localStorage.setItem(myStorage, JSON.stringify(data));
}


export function getData() {
  const savedData = localStorage.getItem(myStorage);

  if (savedData === null) {
    return null;
  }

  try {
    return JSON.parse(savedData);
  } catch {
    throw new Error(
     "error saved data is invalid"
    );
  }
}


export function clearData() {
  localStorage.removeItem(myStorage);
}
