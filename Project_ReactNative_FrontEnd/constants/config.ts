// apiConfig.ts
import { Platform } from "react-native";


const LOCAL_IP = "192.168.1.237";

// const LOCAL_IP = "192.168.1.237";

export const API_BASE_URL = `http://${LOCAL_IP}:8080/api`;

if (__DEV__) {
  console.log("🔧 API Configuration:");
  console.log("📍 Using IP:", LOCAL_IP);
  console.log("🔗 API Base URL:", API_BASE_URL);
}
