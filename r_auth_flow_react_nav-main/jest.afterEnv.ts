import AsyncStorage from "@react-native-async-storage/async-storage";

// The AsyncStorage mock keeps data across tests; without this a session from one test logs in the next.
beforeEach(() => AsyncStorage.clear());
