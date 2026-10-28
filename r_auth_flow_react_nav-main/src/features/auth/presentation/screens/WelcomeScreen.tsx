import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo de KORA */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>KORA</Text>
      </View>

      {/* Círculo con icono central */}
      <View style={styles.iconCircle}>
        <Text style={styles.avatarPlaceholder}>👤</Text>
      </View>

      {/* Textos principales */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>¿Ya tienes cuenta?</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para acceder a tu espacio o crea una cuenta nueva para comenzar.
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        {/* Botón Iniciar Sesión (lleva al LoginScreen existente) */}
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Iniciar Sesión →</Text>
        </TouchableOpacity>

        {/* Botón Registrarse (lleva al SignupScreen existente) */}
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.secondaryButtonText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Ingresar como invitado */}
        <TouchableOpacity 
          onPress={() => {
            // Aquí puedes manejar la lógica o navegar directo si lo deseas
            console.log("Ingresando como invitado...");
          }}
          style={styles.guestLink}
        >
          <Text style={styles.guestText}>Ingresar como invitado</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    marginTop: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#4A0E95', // Color morado característico
    letterSpacing: 2,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F8F6FC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A0E95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarPlaceholder: {
    fontSize: 45,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    backgroundColor: '#4A0E95',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A0E95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4A0E95',
  },
  secondaryButtonText: {
    color: '#4A0E95',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  guestText: {
    color: '#4A0E95',
    fontSize: 14,
    fontWeight: '650',
    textDecorationLine: 'underline',
  },
});