import React, { useState, useCallback, memo } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";

// ✅ Optimized InputField
const InputField = memo(({ label, value, onChangeText }) => {
  console.log("🔄 Rendering InputField:", label); // 👀 Logs only when THIS field updates

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={label}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
});

export default function App() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // ✅ Stable handlers (don't change every render)
  const handleNameChange = useCallback((t) => setForm((p) => ({ ...p, name: t })), []);
  const handlePhoneChange = useCallback((t) => setForm((p) => ({ ...p, phone: t })), []);
  const handleEmailChange = useCallback((t) => setForm((p) => ({ ...p, email: t })), []);
  const handlePasswordChange = useCallback((t) => setForm((p) => ({ ...p, password: t })), []);

  const handleSubmit = () => {
    Alert.alert("Form Submitted", JSON.stringify(form, null, 2));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Optimized Form</Text>
      <InputField label="Name" value={form.name} onChangeText={handleNameChange} />
      <InputField label="Phone" value={form.phone} onChangeText={handlePhoneChange} />
      <InputField label="Email" value={form.email} onChangeText={handleEmailChange} />
      <InputField label="Password" value={form.password} onChangeText={handlePasswordChange} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  field: { marginBottom: 15 },
  label: { marginBottom: 5, fontSize: 16, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 },
  button: { backgroundColor: "#28A745", padding: 12, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
