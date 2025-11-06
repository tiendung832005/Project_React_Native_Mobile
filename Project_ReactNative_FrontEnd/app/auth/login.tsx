import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { login, LoginData } from "../../service/authService";
import { NavigationActions } from "../../navigation";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const data: LoginData = { email, password };
      await login(data);

      // Login thành công - reset stack để vào main app
      // Sử dụng NavigationActions để đảm bảo proper reset
      console.log("Login successful, redirecting to main app");
      NavigationActions.resetToMain();
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message ||
          error.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Logo Instagram */}
      <Text style={styles.logo}>Instagram</Text>

      {/* Input Fields */}
      <View style={styles.contentWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Log in button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Log in</Text>
            )}
          </TouchableOpacity>

          {/* Log in with Facebook */}
          <TouchableOpacity style={styles.facebookButton}>
            <FontAwesome name="facebook-square" size={20} color="#3797EF" />
            <Text style={styles.facebookText}> Log in with Facebook</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Dont have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.signUp}>Sign up.</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom text */}
      <Text style={styles.bottomText}>Instagram or Facebook</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  logo: {
    fontSize: 42,
    fontFamily: "Billabong",
    textAlign: "center",
    marginBottom: 40,
    color: "#000",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#000",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotText: {
    color: "#3797EF",
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: "#3797EF",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  facebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  facebookText: {
    color: "#3797EF",
    fontWeight: "600",
    fontSize: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    marginHorizontal: 10,
    color: "#999",
    fontWeight: "500",
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: 60,
  },
  footerText: {
    color: "#999",
    fontSize: 14,
  },
  signUp: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  bottomText: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    color: "#999",
    fontSize: 12,
  },
});
